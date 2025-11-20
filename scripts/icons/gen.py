from PIL import Image, ImageDraw

def draw_ghost_icon(size, background_color):
    """绘制幽灵图标"""
    # 创建高质量图像，使用透明背景
    img = Image.new('RGBA', (size, size), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 根据尺寸调整参数
    if size == 16:
        padding = 2
        wave_count = 2
        eye_ratio = 0.15
        body_width_ratio = 0.65
    elif size == 48:
        padding = 6
        wave_count = 3
        eye_ratio = 0.12
        body_width_ratio = 0.7
    else:  # 128
        padding = 16
        wave_count = 4
        eye_ratio = 0.1
        body_width_ratio = 0.7
    
    # 计算幽灵身体区域
    body_width = int(size * body_width_ratio)
    body_height = size - padding * 2
    body_x = (size - body_width) // 2
    body_y = padding
    
    # 幽灵颜色
    ghost_color = (255, 255, 255, 255)
    eye_color = background_color  # 眼睛颜色与背景呼应
    
    # 绘制圆角背景
    draw.rounded_rectangle(
        [(0, 0), (size, size)],
        radius=size // 6,
        fill=background_color
    )
    
    # 计算波浪参数
    wave_width = body_width // wave_count
    wave_height = wave_width // 2
    
    # 计算幽灵主体高度（不包括波浪）
    body_main_height = body_height - wave_height
    head_radius = body_width // 2
    
    # 绘制幽灵主体（头部圆形 + 躯干矩形）
    # 头部上半部分是圆形
    draw.ellipse(
        [(body_x, body_y), (body_x + body_width, body_y + body_width)],
        fill=ghost_color
    )
    
    # 躯干矩形（从头部中心到底部）
    torso_top = body_y + head_radius
    torso_bottom = body_y + body_main_height
    draw.rectangle(
        [(body_x, torso_top), (body_x + body_width, torso_bottom)],
        fill=ghost_color
    )
    
    # 绘制底部圆润波浪（使用半圆）
    # 波浪的顶部边缘应该与躯干底部重合
    wave_y = torso_bottom - wave_height
    for i in range(wave_count):
        wave_x = body_x + i * wave_width
        # 绘制向下的半圆弧作为波浪（下半圆，180-360度）
        draw.pieslice(
            [(wave_x, wave_y), (wave_x + wave_width, wave_y + wave_height * 2)],
            start=180,
            end=360,
            fill=ghost_color
        )
    
    # 绘制眼睛
    eye_size = int(size * eye_ratio)
    eye_y = body_y + head_radius - eye_size
    eye_spacing = body_width // 3
    
    # 左眼
    left_eye_x = body_x + (body_width - eye_spacing) // 2 - eye_size
    draw.ellipse(
        [(left_eye_x, eye_y), (left_eye_x + eye_size, eye_y + eye_size)],
        fill=eye_color
    )
    
    # 右眼
    right_eye_x = body_x + (body_width + eye_spacing) // 2
    draw.ellipse(
        [(right_eye_x, eye_y), (right_eye_x + eye_size, eye_y + eye_size)],
        fill=eye_color
    )
    
    return img

# 定义颜色配置
colors = {
    'active': (56, 197, 187, 255),    # 激活态：青绿色 #38C5BB
    'inactive': (41, 44, 51, 255)     # 未激活态：灰色 #292C33
}

# 生成不同尺寸和状态的图标
sizes = [16, 48, 128]

# 生成激活态图标（绿色）
for size in sizes:
    img = draw_ghost_icon(size, colors['active'])
    img.save(f'icon-active-{size}.png')
    print(f'Created icon-active-{size}.png')

# 生成未激活态图标（灰色）
for size in sizes:
    img = draw_ghost_icon(size, colors['inactive'])
    img.save(f'icon-inactive-{size}.png')
    print(f'Created icon-inactive-{size}.png')

print('\n注意：manifest.json 使用 icon-active-{size}.png 作为默认图标')

