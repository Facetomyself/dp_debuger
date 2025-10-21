#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
DrissionPage debug/injection tool (lite)
- Faster startup: on-demand plugins and listeners
- Unified logs: no emojis, structured output
- Injects: js/module_manager.js, js/debug_utils.js, js/cookie_monitor.js, js/scroll.js
"""

import argparse
import os
import sys
import time
import json
import re
import logging
from datetime import datetime
from typing import Any, Dict, Optional, List


# Paths
ROOT = os.path.abspath(os.path.dirname(__file__))
JS_DIR = os.path.join(ROOT, 'js')
LOG_DIR = os.path.join(ROOT, 'logs')
DATA_DIR = os.path.join(ROOT, 'data')
PLUGIN_DIR = os.path.join(ROOT, 'plugin')
CONFIG_DIR = os.path.join(ROOT, 'config')
DEFAULT_CONFIG_PATH = os.path.join(CONFIG_DIR, 'dp_debug.json')

os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

SESSION_ID = datetime.now().strftime('%Y%m%d_%H%M%S')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(LOG_DIR, f'dp_debug_{SESSION_ID}.log'), encoding='utf-8')
    ]
)
logger = logging.getLogger('dp')

try:
    from DrissionPage import Chromium, ChromiumOptions
except ImportError as e:
    logger.error('Failed to import DrissionPage: %s', e)
    logger.error('Install DrissionPage: pip install DrissionPage')
    sys.exit(1)


def load_config(path: str) -> Dict[str, Any]:
    if not path:
        return {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            logger.info('Loaded config %s', path)
            return cfg if isinstance(cfg, dict) else {}
    except FileNotFoundError:
        logger.info('Config file not found %s', path)
        return {}
    except Exception as e:
        logger.warning('Failed to read config: %s', e)
        return {}


def _detect_chrome_path() -> str:
    """Locate Chrome/Chromium on Windows common paths. Return empty string if not found."""
    candidates: List[str] = []
    candidates.append(os.path.join(ROOT, 'chrome', 'Chrome-bin', 'chrome.exe'))
    if os.environ.get('DP_CHROME'):
        candidates.append(os.environ['DP_CHROME'])
    program_files = os.environ.get('ProgramFiles', r'C:\\Program Files')
    program_files_x86 = os.environ.get('ProgramFiles(x86)', r'C:\\Program Files (x86)')
    local_appdata = os.environ.get('LOCALAPPDATA', '')
    candidates += [
        os.path.join(program_files, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        os.path.join(program_files_x86, 'Google', 'Chrome', 'Application', 'chrome.exe')
    ]
    if local_appdata:
        candidates.append(os.path.join(local_appdata, 'Google', 'Chrome', 'Application', 'chrome.exe'))
    for path in candidates:
        try:
            if path and os.path.isfile(path):
                return path
        except Exception:
            pass
    return ''


class DPDebugger:
    def __init__(
        self,
        chrome_path: str,
        load_plugins: bool = False,
        plugin_names: Optional[List[str]] = None,
        headless: bool = False,
        user_data_dir: str = '',
        proxy: str = '',
        devtools: bool = False,
        extra_js: Optional[List[str]] = None,
        listen_patterns: Optional[List[str]] = None,
        network_out: str = '',
        net_include: Optional[List[str]] = None,
        net_exclude: Optional[List[str]] = None,
        net_content_types: Optional[List[str]] = None,
        net_headers: bool = True,
        net_bodies: bool = False,
        net_max_body_chars: int = 0,
        net_redact_headers: Optional[List[str]] = None
    ) -> None:
        self.chrome_path = chrome_path or ''
        self.load_plugins = load_plugins
        self.plugin_names = set(plugin_names or [])
        self.browser = None
        self.tab = None
        self.plugin_paths = []
        self.headless = bool(headless)
        self.user_data_dir = user_data_dir or ''
        self.proxy = proxy or ''
        self.devtools = bool(devtools)
        self.extra_js = extra_js or []
        self.listen_patterns = list(listen_patterns or [])
        self.network_out = network_out or ''
        self.net_include = list(net_include or [])
        self.net_exclude = list(net_exclude or [])
        self.net_content_types = [s.lower() for s in (net_content_types or [])]
        self.net_headers = bool(net_headers)
        self.net_bodies = bool(net_bodies)
        self.net_max_body_chars = int(net_max_body_chars or 0)
        self.net_redact_headers = set([s.lower() for s in (net_redact_headers or ['authorization','proxy-authorization','cookie','set-cookie'])])

        # precompile regex-style patterns like /.../
        self._compiled_include = self._compile_patterns(self.net_include)
        self._compiled_exclude = self._compile_patterns(self.net_exclude)

        # Default browser path fallback
        if not self.chrome_path or not os.path.isfile(self.chrome_path):
            default_portable = os.path.join(ROOT, 'chrome', 'Chrome-bin', 'chrome.exe')
            if os.path.isfile(default_portable):
                self.chrome_path = default_portable
            else:
                auto = _detect_chrome_path()
                if auto:
                    self.chrome_path = auto

        if self.load_plugins:
            self._discover_plugins()

    def _discover_plugins(self) -> None:
        if not os.path.isdir(PLUGIN_DIR):
            logger.info('Plugin directory not found: %s', PLUGIN_DIR)
            return
        for item in os.listdir(PLUGIN_DIR):
            p = os.path.join(PLUGIN_DIR, item)
            if os.path.isdir(p) and os.path.exists(os.path.join(p, 'manifest.json')):
                if self.plugin_names and item not in self.plugin_names:
                    continue
                self.plugin_paths.append(p)
        if self.plugin_names:
            logger.info('Loading plugins whitelist: %s', ', '.join(sorted(self.plugin_names)))
        logger.info('Found plugins: %d', len(self.plugin_paths))
    def _create_options(self) -> ChromiumOptions:
        opt = ChromiumOptions()
        if self.chrome_path and os.path.isfile(self.chrome_path):
            opt.set_browser_path(self.chrome_path)

        # Headless
        try:
            if self.headless and hasattr(opt, 'headless'):
                opt.headless(True)
            elif self.headless:
                opt.set_argument('--headless=new')
        except Exception:
            pass

        # User data dir
        if self.user_data_dir:
            try:
                opt.set_argument(f'--user-data-dir={self.user_data_dir}')
            except Exception:
                pass

        # Proxy
        if self.proxy:
            try:
                opt.set_argument(f'--proxy-server={self.proxy}')
            except Exception:
                pass

        # DevTools auto open
        if self.devtools:
            try:
                opt.set_argument('--auto-open-devtools-for-tabs')
            except Exception:
                pass

        # Performance / robustness
        if hasattr(opt, 'ignore_certificate_errors'):
            opt.ignore_certificate_errors()
        opt.set_pref('profile.managed_default_content_settings.images', 2)
        opt.set_pref('profile.default_content_setting_values.notifications', 2)
        opt.set_argument('--disable-gpu')
        opt.set_argument('--disable-features=VizDisplayCompositor')

        # Load extensions on demand
        if self.load_plugins and self.plugin_paths:
            for p in self.plugin_paths:
                try:
                    opt.add_extension(p)
                except Exception as e:
                    logger.warning('Add extension failed %s: %s', p, e)
        return opt

    # -------- Network helpers --------
    def _compile_patterns(self, patterns: List[str]) -> List[Any]:
        comps: List[Any] = []
        for p in patterns:
            p = str(p).strip()
            if not p:
                continue
            if len(p) >= 2 and p.startswith('/') and p.endswith('/'):
                try:
                    comps.append(re.compile(p[1:-1]))
                except Exception:
                    # fallback to substring
                    comps.append(p[1:-1])
            else:
                comps.append(p)
        return comps

    def _match_any(self, text: str, comps: List[Any]) -> bool:
        if not comps:
            return False
        t = text or ''
        for c in comps:
            if isinstance(c, str):
                if c and c in t:
                    return True
            else:
                try:
                    if c.search(t):
                        return True
                except Exception:
                    pass
        return False

    def _should_log_url(self, url: str, content_type: str) -> bool:
        # include filter: if provided, must match at least one
        if self._compiled_include:
            if not self._match_any(url, self._compiled_include):
                return False
        # exclude filter: if matches any, drop
        if self._compiled_exclude and self._match_any(url, self._compiled_exclude):
            return False
        # content type filter
        if self.net_content_types:
            ct = (content_type or '').lower()
            if not any(x in ct for x in self.net_content_types):
                return False
        return True

    def _normalize_headers(self, raw) -> Dict[str, str]:
        res: Dict[str, str] = {}
        try:
            if isinstance(raw, dict):
                items = raw.items()
            elif hasattr(raw, 'items'):
                items = list(raw.items())
            elif isinstance(raw, (list, tuple)):
                items = raw
            elif isinstance(raw, str):
                items = []
                for line in raw.splitlines():
                    if ':' in line:
                        k, v = line.split(':', 1)
                        items.append((k.strip(), v.strip()))
            else:
                items = []
            for k, v in items:
                key = str(k).strip()
                val = '' if v is None else str(v).strip()
                if key.lower() in self.net_redact_headers:
                    val = '[REDACTED]'
                res[key] = val
        except Exception:
            pass
        return res

    def _safe_text(self, data) -> str:
        if data is None:
            return ''
        try:
            if isinstance(data, bytes):
                return data.decode('utf-8', errors='replace')
            s = str(data)
            return s
        except Exception:
            return ''

    def start(self) -> None:
        logger.info('Starting browser...')
        self.browser = Chromium(self._create_options())
        self.tab = self.browser.latest_tab
        logger.info('Browser ready')

    def open(self, url: str, wait: float = 1.0) -> None:
        logger.info('Open: %s', url)
        self.tab.get(url)
        if wait > 0:
            time.sleep(wait)
        logger.info('Title: %s', self.tab.title)

    def inject_js_modules(self) -> None:
        files = ['module_manager.js', 'debug_utils.js', 'cookie_monitor.js', 'scroll.js']
        chunks: List[str] = []
        for fname in files:
            path = os.path.join(JS_DIR, fname)
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    code = f.read()
                chunks.append('\n/* ' + fname + ' */\n' + code + '\n')
                logger.info('Loaded JS module: %s (%d chars)', fname, len(code))
            else:
                logger.info('Missing JS module: %s', fname)
        # extra js files
        for entry in self.extra_js:
            path = entry
            rel = os.path.join(JS_DIR, entry)
            if os.path.exists(rel):
                path = rel
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        code = f.read()
                    chunks.append('\n/* extra: ' + os.path.basename(path) + ' */\n' + code + '\n')
                    logger.info('Loaded extra JS: %s (%d chars)', path, len(code))
                except Exception as e:
                    logger.warning('Read extra JS failed %s: %s', path, e)
            else:
                logger.warning('Extra JS not found: %s', entry)
        if chunks:
            script = '\n'.join(chunks)
            self.tab.run_js(script)
            logger.info('Injected JS modules')

    def apply_js_config(self, cfg: Dict[str, Any]) -> None:
        if not cfg:
            return
        parts: List[str] = []

        cm = cfg.get('cookieMonitor') or {}
        if cm:
            ignore = cm.get('ignoreUnchanged', False)
            enable = cm.get('enableEvent', {"add": True, "update": True, "delete": True, "read": True})
            rules = cm.get('rules', [])
            rules_json = json.dumps(rules, ensure_ascii=False)
            enable_json = json.dumps(enable, ensure_ascii=False)
            js_cm = f"""
            if (window.DP_COOKIE_MONITOR) {{
                window.DP_COOKIE_MONITOR.ignoreUnchanged = {str(bool(ignore)).lower()};
                window.DP_COOKIE_MONITOR.enableEvent = {enable_json};
                (function() {{
                    var r = {rules_json};
                    r = r.map(function(x) {{
                        if (typeof x === 'string' && /^\/.+\/$/.test(x)) return new RegExp(x.slice(1, -1));
                        if (x && typeof x === 'object') {{
                            if (typeof x.name === 'string' && /^\/.+\/$/.test(x.name)) x.name = new RegExp(x.name.slice(1, -1));
                            if (typeof x.value === 'string' && /^\/.+\/$/.test(x.value)) x.value = new RegExp(x.value.slice(1, -1));
                        }}
                        return x;
                    }});
                    window.DP_COOKIE_MONITOR.setRules(r);
                }})();
            }}
            """
            parts.append(js_cm)

        du = cfg.get('debugUtils') or {}
        if du:
            intercept_xhr = bool(du.get('interceptXHR', False))
            intercept_fetch = bool(du.get('interceptFetch', False))
            dom_observer = bool(du.get('startDOMObserver', False))
            perf_ms = int(du.get('startPerformanceMonitorMs', 0) or 0)
            lines: List[str] = ["if (window.DP_DEBUG) {"]
            if intercept_xhr:
                lines.append("try{window.DP_DEBUG.interceptXHR();}catch(e){}");
            if intercept_fetch:
                lines.append("try{window.DP_DEBUG.interceptFetch();}catch(e){}");
            if dom_observer:
                lines.append("try{window.DP_DEBUG.startDOMObserver();}catch(e){}");
            if perf_ms and perf_ms > 0:
                lines.append(f"try{{window.DP_DEBUG.startPerformanceMonitor({perf_ms});}}catch(e){{}}");
            lines.append("}")
            parts.append("\n".join(lines))

        script = "\n".join(parts).strip()
        if script:
            self.tab.run_js(script)
            logger.info('Applied JS config')

    def start_listen(self, *patterns: str) -> None:
        pats = patterns or tuple(self.listen_patterns) or ('http',)
        self.tab.listen.start(*pats)
        logger.info('Network listening started %s', list(pats))

    def drain_packets(self, timeout: float = 0.1):
        items: List[Any] = []
        try:
            for pkt in self.tab.listen.steps(timeout=timeout):
                items.append(pkt)
        except Exception as e:
            logger.debug('Get network packet error: %s', e)
        return items

    def save_packet(self, pkt) -> None:
        try:
            req = getattr(pkt, 'request', None)
            res = getattr(pkt, 'response', None)
            url = getattr(req, 'url', '')
            method = getattr(req, 'method', '')
            status = getattr(res, 'status', '')

            req_headers = {}
            res_headers = {}
            content_type = ''
            if self.net_headers:
                req_headers = self._normalize_headers(getattr(req, 'headers', getattr(req, 'req_headers', {})))
                res_headers = self._normalize_headers(getattr(res, 'headers', getattr(res, 'resp_headers', {})))
                content_type = res_headers.get('content-type', '') or res_headers.get('Content-Type', '')

            if not self._should_log_url(url, content_type):
                return

            req_body = ''
            res_body = ''
            req_body_len = None
            res_body_len = None
            if self.net_bodies:
                try:
                    rb = getattr(req, 'postData', None)
                    if rb is None:
                        rb = getattr(req, 'body', None)
                    if rb is not None:
                        txt = self._safe_text(rb)
                        req_body_len = len(txt)
                        if self.net_max_body_chars and req_body_len > self.net_max_body_chars:
                            req_body = txt[: self.net_max_body_chars] + '...[TRUNCATED]'
                        else:
                            req_body = txt
                except Exception:
                    pass
                try:
                    rb2 = getattr(res, 'body', None)
                    if rb2 is None:
                        rb2 = getattr(res, 'text', None)
                    if rb2 is not None:
                        txt2 = self._safe_text(rb2)
                        res_body_len = len(txt2)
                        if self.net_max_body_chars and res_body_len > self.net_max_body_chars:
                            res_body = txt2[: self.net_max_body_chars] + '...[TRUNCATED]'
                        else:
                            res_body = txt2
                except Exception:
                    pass

            if res_body_len is None:
                try:
                    cl = res_headers.get('content-length') or res_headers.get('Content-Length')
                    if cl is not None:
                        res_body_len = int(str(cl).strip())
                except Exception:
                    pass

            started = getattr(req, 'timestamp', None) or getattr(req, 'start_time', None)
            finished = getattr(res, 'timestamp', None) or getattr(res, 'end_time', None)
            duration_ms = None
            try:
                if started and finished:
                    duration_ms = round((float(finished) - float(started)) * 1000.0, 3)
            except Exception:
                duration_ms = None

            info = {
                'time': datetime.now().isoformat(),
                'url': url,
                'method': method,
                'status': status,
                'content_type': content_type,
                'duration_ms': duration_ms,
            }
            if self.net_headers:
                info['request_headers'] = req_headers
                info['response_headers'] = res_headers
            if self.net_bodies:
                if req_body_len is not None:
                    info['request_body_len'] = req_body_len
                if req_body:
                    info['request_body'] = req_body
                if res_body_len is not None:
                    info['response_body_len'] = res_body_len
                if res_body:
                    info['response_body'] = res_body

            path = self.network_out or os.path.join(DATA_DIR, f'network_packets_' + SESSION_ID + '.jsonl')
            with open(path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(info, ensure_ascii=False) + '\n')
        except Exception as e:
            logger.debug('save packet error: %s', e)

    def start_console(self) -> None:
        try:
            self.tab.console.start()
            logger.info('Console log listener started')
        except Exception as e:
            logger.warning('Console log listener failed: %s', e)

    def drain_console(self, timeout: float = 0.05) -> None:
        try:
            msg = self.tab.console.wait(timeout=timeout)
            if not msg:
                return
            text = getattr(msg, 'text', '')
            if text:
                logger.info('Console %s', text)
                path = os.path.join(LOG_DIR, f'console_logs_{SESSION_ID}.txt')
                with open(path, 'a', encoding='utf-8') as f:
                    f.write(text.replace('\\r\\n', '\\n').replace('\\r', '\\n') + '\\n')
                try:
                    path_jsonl = os.path.join(LOG_DIR, f'console_logs_{SESSION_ID}.jsonl')
                    with open(path_jsonl, 'a', encoding='utf-8') as jf:
                        jf.write(json.dumps({'time': datetime.now().isoformat(), 'text': text}, ensure_ascii=False) + '\n')
                except Exception:
                    pass
        except Exception:
            pass

    def close(self) -> None:
        try:
            if self.browser:
                self.browser.quit()
                logger.info('Browser closed')
        except Exception as e:
            logger.warning('Exception closing browser: %s', e)


def parse_args():
    p = argparse.ArgumentParser(description="DrissionPage debug/inject tool")
    p.add_argument("--url", default=os.environ.get("DP_URL", "about:blank"), help="Target URL")
    p.add_argument("--inject", action="store_true", default=True, help="Inject JS modules (default on)")
    p.add_argument("--no-inject", dest="inject", action="store_false", help="Disable JS injection")
    p.add_argument("--listen", action="store_true", default=False, help="Enable network listening")
    p.add_argument("--chrome", default=os.environ.get("DP_CHROME", os.path.join(ROOT, "chrome", "Chrome-bin", "chrome.exe")), help="Chrome path")
    p.add_argument("--load-plugins", action="store_true", default=(os.environ.get("DP_LOAD_PLUGINS", "0") == "1"), help="Load extensions under plugin/")
    p.add_argument("--plugins", default="", help="Load only these plugins (comma separated dir names)")
    default_cfg = DEFAULT_CONFIG_PATH if os.path.exists(DEFAULT_CONFIG_PATH) else ""
    p.add_argument("--config", default=default_cfg, help="Config file path (JSON)")
    p.add_argument("--log-level", default=os.environ.get("DP_LOG_LEVEL", "INFO"), choices=["DEBUG", "INFO", "WARNING", "ERROR"], help="Log level")
    p.add_argument("--headless", action="store_true", default=(os.environ.get("DP_HEADLESS", "0") == "1"), help="Headless mode")
    p.add_argument("--devtools", action="store_true", default=(os.environ.get("DP_DEVTOOLS", "0") == "1"), help="Auto open DevTools")
    p.add_argument("--user-data-dir", default=os.environ.get("DP_USER_DATA_DIR", ""), help="User data dir")
    p.add_argument("--proxy", default=os.environ.get("DP_PROXY", ""), help="Proxy, e.g. http://127.0.0.1:7890")
    p.add_argument("--listen-patterns", default=os.environ.get("DP_LISTEN", "http"), help="Listen types, comma separated, e.g. http,ws")
    p.add_argument("--save-network", default=os.environ.get("DP_SAVE_NETWORK", ""), help="Network JSONL output file; empty for default path")
    p.add_argument("--js", default=os.environ.get("DP_EXTRA_JS", ""), help="Extra JS files to inject, comma separated (relative to js/ or absolute)")
    p.add_argument("--timeout", type=float, default=float(os.environ.get("DP_TIMEOUT", "0") or 0), help="Run seconds; 0 to run until Ctrl+C")
    p.add_argument("--net-include", default=os.environ.get("DP_NET_INCLUDE", ""), help="Include filter, comma separated or /regex/")
    p.add_argument("--net-exclude", default=os.environ.get("DP_NET_EXCLUDE", ""), help="Exclude filter, comma separated or /regex/")
    p.add_argument("--net-content-types", default=os.environ.get("DP_NET_CT", ""), help="Require content-type contains any (comma separated)")
    p.add_argument("--net-headers", dest="net_headers", action="store_true", default=(os.environ.get("DP_NET_HEADERS","1")=="1"), help="Save request/response headers")
    p.add_argument("--no-net-headers", dest="net_headers", action="store_false")
    p.add_argument("--net-bodies", dest="net_bodies", action="store_true", default=(os.environ.get("DP_NET_BODIES","0")=="1"), help="Save request/response bodies")
    p.add_argument("--no-net-bodies", dest="net_bodies", action="store_false")
    p.add_argument("--max-body-chars", type=int, default=int(os.environ.get("DP_NET_MAX_BODY","0") or 0), help="Max chars kept per body; 0 disables truncation")
    p.add_argument("--redact-headers", default=os.environ.get("DP_NET_REDACT", "authorization,proxy-authorization,cookie,set-cookie"), help="Headers to redact (comma separated, case-insensitive)")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config) if args.config else {}

    # Merge startup config (config has priority)
    startup = cfg.get('startup', {}) if isinstance(cfg, dict) else {}
    url = startup.get('url', args.url)
    inject = bool(startup.get('inject', args.inject))
    listen = bool(startup.get('listen', args.listen))
    chrome = startup.get('chrome', args.chrome)
    load_plugins = bool(startup.get('loadPlugins', args.load_plugins))
    plugin_names: List[str] = []
    if 'plugins' in startup and isinstance(startup['plugins'], list):
        plugin_names = [str(x) for x in startup['plugins']]
    elif args.plugins:
        plugin_names = [x.strip() for x in args.plugins.split(',') if x.strip()]

    # Extra debug & runtime options
    log_level = str(startup.get('logLevel', args.log_level)).upper()
    headless = bool(startup.get('headless', args.headless))
    devtools = bool(startup.get('devtools', args.devtools))
    user_data_dir = startup.get('userDataDir', args.user_data_dir)
    proxy = startup.get('proxy', args.proxy)
    listen_patterns = startup.get('listenPatterns', args.listen_patterns)
    save_network = startup.get('saveNetwork', args.save_network)
    timeout = float(startup.get('timeout', args.timeout or 0) or 0)
    extra_js = startup.get('jsFiles', args.js)
    if isinstance(extra_js, str):
        extra_js = [x.strip() for x in extra_js.split(',') if x.strip()]
    elif not isinstance(extra_js, list) or not extra_js:
        extra_js = []

    # Network capture config
    network_cfg = cfg.get('network', {}) if isinstance(cfg, dict) else {}
    def _csv_to_list(s: str) -> List[str]:
        return [x.strip() for x in str(s or '').split(',') if str(x or '').strip()]
    net_include = network_cfg.get('include', args.net_include)
    net_exclude = network_cfg.get('exclude', args.net_exclude)
    net_cts = network_cfg.get('contentTypes', args.net_content_types)
    if isinstance(net_include, str):
        net_include = _csv_to_list(net_include)
    if isinstance(net_exclude, str):
        net_exclude = _csv_to_list(net_exclude)
    if isinstance(net_cts, str):
        net_cts = _csv_to_list(net_cts)
    net_headers = bool(network_cfg.get('headers', args.net_headers))
    net_bodies = bool(network_cfg.get('bodies', args.net_bodies))
    net_max_body_chars = int(network_cfg.get('maxBodyChars', args.max_body_chars)) if hasattr(args, 'max_body_chars') else 0
    redact_headers = network_cfg.get('redactHeaders', args.redact_headers)
    if isinstance(redact_headers, str):
        redact_headers = _csv_to_list(redact_headers)

    # Set log level
    try:
        logger.setLevel(getattr(logging, log_level, logging.INFO))
    except Exception:
        logger.setLevel(logging.INFO)
    logger.info('Startup args (merged): url=%s inject=%s listen=%s load_plugins=%s plugins=%s headless=%s devtools=%s log=%s', url, inject, listen, load_plugins, ','.join(plugin_names) or '-', headless, devtools, log_level)

    # normalize listen patterns
    listen_list: List[str] = []
    if isinstance(listen_patterns, str) and listen_patterns.strip():
        listen_list = [x.strip() for x in listen_patterns.split(',') if x.strip()]
    elif isinstance(listen_patterns, list):
        listen_list = [str(x).strip() for x in listen_patterns if str(x).strip()]

    dbg = DPDebugger(
        chrome_path=chrome,
        load_plugins=load_plugins,
        plugin_names=plugin_names,
        headless=headless,
        user_data_dir=user_data_dir,
        proxy=proxy,
        devtools=devtools,
        extra_js=extra_js,
        listen_patterns=listen_list,
        network_out=str(save_network or '').strip(),
        net_include=net_include,
        net_exclude=net_exclude,
        net_content_types=net_cts,
        net_headers=net_headers,
        net_bodies=net_bodies,
        net_max_body_chars=net_max_body_chars,
        net_redact_headers=redact_headers
    )
    try:
        dbg.start()
        dbg.open(url, wait=1.0)

        if inject:
            dbg.inject_js_modules()
            dbg.apply_js_config(cfg)
            dbg.start_console()

        if listen:
            if listen_list:
                dbg.start_listen(*listen_list)
            else:
                dbg.start_listen('http')

        logger.info('Ready. Press Ctrl+C to exit. Logs %s', LOG_DIR)

        deadline = time.time() + timeout if timeout and timeout > 0 else None
        while True:
            if inject:
                dbg.drain_console(0.05)
            if listen:
                for pkt in dbg.drain_packets(0.05):
                    dbg.save_packet(pkt)
            time.sleep(0.1)
            if deadline and time.time() >= deadline:
                logger.info('Timeout reached. Exiting')
                break
    except KeyboardInterrupt:
        logger.info('Interrupt received')
    finally:
        dbg.close()

if __name__ == '__main__':
    main()
