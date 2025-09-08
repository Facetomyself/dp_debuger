# 导入
from concurrent.futures import ThreadPoolExecutor, as_completed
from DrissionPage import Chromium, ChromiumOptions
import time
import random
from helper import helper_mouse_click

chrome_path = r"D:\python_project\DrissionPage\chrome\Chrome-bin\chrome.exe"

def pass_cloudflare_task():
    try:
        print("正在启动浏览器...")
        co = ChromiumOptions().auto_port().headless(False).set_browser_path(chrome_path)
        browser = Chromium(co)
        print(f"浏览器PID: {browser.process_id}")

        # 获取标签页对象
        tab = browser.latest_tab
        print("正在访问 Cloudflare 登录页面...")

        # 访问网页
        tab.get('https://dash.cloudflare.com/login')
        print("页面加载完成，等待 Cloudflare 验证...")

        # 等待 Cloudflare 验证元素出现
        try:
            cwc_ele = tab.ele("t:div@data-testid=challenge-widget-container", timeout=10)
            print("找到 Cloudflare 验证元素")

            div_ele = cwc_ele.child(2).child(1)
            e1 = div_ele.sr("t:iframe")
            e1.wait.eles_loaded("t:body")
            e2 = e1.ele("t:body")
            e3 = e2.sr("t:div")
            e4 = e3.ele("@type=checkbox", timeout=10)
            print("准备点击验证复选框...")

            time.sleep(random.uniform(0.5, 1))
            helper_mouse_click(browser.process_id, 226, 682)
            print("已点击验证复选框")
            input('按回车继续...')

            time.sleep(random.uniform(2, 2.5))

        except Exception as e:
            print(f"Cloudflare 验证处理出错: {e}")

        # 关闭浏览器
        browser.quit()
        print("浏览器已关闭")

    except Exception as e:
        print(f"任务执行失败: {e}")
        try:
            browser.quit()
        except:
            pass  

    

if __name__ == "__main__":
    max_workers = 2  # 设置最大线程数为2
    task_number = 4  # 设置任务数量为4

    print(f"开始执行 {task_number} 个任务，使用 {max_workers} 个线程...")

    with ThreadPoolExecutor(max_workers) as executor:
        futures = []
        for i in range(task_number):
            print(f"提交任务 {i+1}")
            future = executor.submit(pass_cloudflare_task)
            futures.append(future)

        print("等待所有任务完成...")
        for future in as_completed(futures):
            try:
                result = future.result()
                print("任务完成")
            except Exception as e:
                print(f"任务执行出错: {e}")

    print("所有任务已完成")
    input('按回车继续...')  # 等待用户登录




