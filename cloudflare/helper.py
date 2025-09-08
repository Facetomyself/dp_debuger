import pygetwindow
import win32api, win32con
import win32process
import time
#用于多线程进行窗口操作


def get_process_id_from_window(hwnd):
    # 通过句柄获取【线程ID 进程ID】
    thread_id, process_id = win32process.GetWindowThreadProcessId(hwnd)
    return process_id

def get_window_postation(hwnd):
    """
    获取窗口坐标
    :param hwnd: 窗口句柄
    :return:
    """
    # 获取窗口坐标
    import win32gui, win32con, win32api, win32print

    # 获取屏幕设备上下文
    hDC = win32gui.GetDC(0)

    # 获取屏幕的真实宽度和缩放后的宽度
    real_w = win32print.GetDeviceCaps(hDC, win32con.DESKTOPHORZRES)
    apparent_w = win32api.GetSystemMetrics(0)

    # 计算缩放比
    scale_radio = real_w / apparent_w

    # 获取原始窗口坐标
    origin_window_rect = win32gui.GetWindowRect(hwnd)

    # 根据缩放比修正窗口坐标
    fixed_window_rect = [item * scale_radio for item in origin_window_rect]
    return fixed_window_rect

def helper_mouse_click(windowPid, x, y):
    """
    根据绝对坐标点击鼠标
    """
    for window in pygetwindow.getAllWindows():
        hwnd = window._hWnd
        pid = get_process_id_from_window(hwnd)

        if (pid == windowPid):
            # window.maximize()  # 最大化窗口
            for i in range(3):
                click_point(hwnd, x, y)

# 异步点击鼠标事件
def click_point(hwnd, x, y):
    # 左键按住
    win32api.PostMessage(hwnd, win32con.WM_LBUTTONDOWN, 0, ((y) << 16 | (x)));
    # 等待
    time.sleep(0.5)
    # 左键松手
    win32api.PostMessage(hwnd, win32con.WM_LBUTTONUP, 0, ((y) << 16 | (x)));

