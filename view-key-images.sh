#!/bin/bash

# 武侠电影数据可视化 - 关键设计图查看脚本

echo "🎨 武侠电影数据可视化 - 关键设计图查看"
echo "========================================"

# 检查是否有图片查看器
if command -v open >/dev/null 2>&1; then
    VIEWER="open"
elif command -v xdg-open >/dev/null 2>&1; then
    VIEWER="xdg-open"
else
    echo "❌ 未找到图片查看器"
    exit 1
fi

# 定义关键图片
declare -A key_images=(
    ["首页整体设计"]="pdf-images/categorized/large-designs/image-002.jpg"
    ["洋流图核心设计"]="pdf-images/categorized/large-designs/image-004.jpg"
    ["竹子图设计"]="pdf-images/categorized/large-designs/image-006.jpg"
    ["详情页设计"]="pdf-images/categorized/large-designs/image-046.jpg"
    ["气泡图设计"]="pdf-images/categorized/medium-charts/image-048.jpg"
    ["模式切换界面"]="pdf-images/categorized/large-designs/image-116.jpg"
    ["最大设计稿"]="pdf-images/categorized/large-designs/image-144.jpg"
    ["词云设计"]="pdf-images/categorized/large-designs/image-270.jpg"
)

# 显示菜单
echo "请选择要查看的设计图："
echo "1. 首页整体设计 (image-002.jpg - 152KB)"
echo "2. 洋流图核心设计 (image-004.jpg - 175KB)"
echo "3. 竹子图设计 (image-006.jpg - 99KB)"
echo "4. 详情页设计 (image-046.jpg - 70KB)"
echo "5. 气泡图设计 (image-048.jpg - 23KB)"
echo "6. 模式切换界面 (image-116.jpg - 100KB)"
echo "7. 最大设计稿 (image-144.jpg - 179KB)"
echo "8. 词云设计 (image-270.jpg - 56KB)"
echo "9. 查看所有大尺寸设计图"
echo "0. 退出"

read -p "请输入选项 (0-9): " choice

case $choice in
    1)
        echo "🖼️  打开首页整体设计..."
        $VIEWER "${key_images[首页整体设计]}"
        ;;
    2)
        echo "🌊 打开洋流图核心设计..."
        $VIEWER "${key_images[洋流图核心设计]}"
        ;;
    3)
        echo "🎋 打开竹子图设计..."
        $VIEWER "${key_images[竹子图设计]}"
        ;;
    4)
        echo "📄 打开详情页设计..."
        $VIEWER "${key_images[详情页设计]}"
        ;;
    5)
        echo "💭 打开气泡图设计..."
        $VIEWER "${key_images[气泡图设计]}"
        ;;
    6)
        echo "🔄 打开模式切换界面..."
        $VIEWER "${key_images[模式切换界面]}"
        ;;
    7)
        echo "🎨 打开最大设计稿..."
        $VIEWER "${key_images[最大设计稿]}"
        ;;
    8)
        echo "☁️  打开词云设计..."
        $VIEWER "${key_images[词云设计]}"
        ;;
    9)
        echo "📁 打开所有大尺寸设计图目录..."
        $VIEWER "pdf-images/categorized/large-designs/"
        ;;
    0)
        echo "👋 退出查看器"
        exit 0
        ;;
    *)
        echo "❌ 无效选项，请重新运行脚本"
        exit 1
        ;;
esac

echo "✅ 图片已在默认应用中打开"
echo "💡 提示：这些图片是从PDF中提取的设计参考，用于指导前端开发" 