#!/bin/bash

# 图片分类验证和修复脚本

echo "🔍 检查PDF图片提取和分类状态"
echo "================================"

# 获取当前路径
CURRENT_DIR=$(pwd)
echo "📍 当前工作目录: $CURRENT_DIR"

# 检查主要目录
echo ""
echo "📁 检查目录结构:"

if [ -d "pdf-images" ]; then
    echo "✅ pdf-images/ 目录存在"
    TOTAL_IMAGES=$(ls pdf-images/*.jpg pdf-images/*.png 2>/dev/null | wc -l)
    echo "   📊 原始图片总数: $TOTAL_IMAGES"
else
    echo "❌ pdf-images/ 目录不存在"
    echo "💡 请先运行图片提取命令"
    exit 1
fi

if [ -d "pdf-images/categorized" ]; then
    echo "✅ pdf-images/categorized/ 目录存在"
else
    echo "❌ pdf-images/categorized/ 目录不存在，正在创建..."
    mkdir -p pdf-images/categorized/{large-designs,medium-charts,small-icons,duplicates}
    echo "✅ 分类目录已创建"
fi

# 检查各分类目录
echo ""
echo "📂 检查分类目录:"

categories=("large-designs" "medium-charts" "small-icons" "duplicates")

for category in "${categories[@]}"; do
    dir_path="pdf-images/categorized/$category"
    if [ -d "$dir_path" ]; then
        count=$(ls "$dir_path" 2>/dev/null | wc -l)
        echo "✅ $category/ - $count 个文件"
    else
        echo "❌ $category/ 目录不存在，正在创建..."
        mkdir -p "$dir_path"
        echo "✅ $category/ 目录已创建"
    fi
done

# 如果分类目录为空，重新分类
echo ""
echo "🔄 检查是否需要重新分类:"

large_count=$(ls pdf-images/categorized/large-designs/ 2>/dev/null | wc -l)
if [ "$large_count" -eq 0 ]; then
    echo "📦 正在重新分类图片..."
    
    # 分类大尺寸图片 (>50KB)
    find pdf-images/ -maxdepth 1 -name "*.jpg" -size +50k -exec cp {} pdf-images/categorized/large-designs/ \; 2>/dev/null
    large_new=$(ls pdf-images/categorized/large-designs/ 2>/dev/null | wc -l)
    echo "✅ 大尺寸设计图: $large_new 个"
    
    # 分类中等尺寸图片 (10KB-50KB)
    find pdf-images/ -maxdepth 1 -name "*.jpg" -size +10k -size -50k -exec cp {} pdf-images/categorized/medium-charts/ \; 2>/dev/null
    medium_new=$(ls pdf-images/categorized/medium-charts/ 2>/dev/null | wc -l)
    echo "✅ 中等尺寸图表: $medium_new 个"
    
    # 分类小尺寸图片 (<10KB)
    find pdf-images/ -maxdepth 1 -name "*.jpg" -size -10k -exec cp {} pdf-images/categorized/small-icons/ \; 2>/dev/null
    small_new=$(ls pdf-images/categorized/small-icons/ 2>/dev/null | wc -l)
    echo "✅ 小图标: $small_new 个"
    
    echo "🎉 图片重新分类完成！"
else
    echo "✅ 图片已经分类完成"
fi

# 显示最终统计
echo ""
echo "📊 最终统计:"
echo "================================"

total_original=$(ls pdf-images/*.jpg pdf-images/*.png 2>/dev/null | wc -l)
total_large=$(ls pdf-images/categorized/large-designs/ 2>/dev/null | wc -l)
total_medium=$(ls pdf-images/categorized/medium-charts/ 2>/dev/null | wc -l)
total_small=$(ls pdf-images/categorized/small-icons/ 2>/dev/null | wc -l)

echo "📁 原始图片总数: $total_original"
echo "🎨 大尺寸设计图: $total_large (>50KB)"
echo "📊 中等尺寸图表: $total_medium (10-50KB)"
echo "🔘 小图标: $total_small (<10KB)"

# 显示关键文件
echo ""
echo "🎯 关键设计图:"
echo "================================"

key_files=(
    "image-002.jpg:首页整体设计"
    "image-004.jpg:洋流图核心设计"
    "image-006.jpg:竹子图设计"
    "image-046.jpg:详情页设计"
    "image-144.jpg:最大设计稿"
)

for file_info in "${key_files[@]}"; do
    IFS=':' read -r filename description <<< "$file_info"
    if [ -f "pdf-images/categorized/large-designs/$filename" ]; then
        size=$(ls -lh "pdf-images/categorized/large-designs/$filename" | awk '{print $5}')
        echo "✅ $filename ($size) - $description"
    else
        echo "❌ $filename - $description (未找到)"
    fi
done

# 提供快速访问命令
echo ""
echo "🚀 快速访问命令:"
echo "================================"
echo "查看大尺寸设计图: open pdf-images/categorized/large-designs/"
echo "查看中等图表: open pdf-images/categorized/medium-charts/"
echo "查看小图标: open pdf-images/categorized/small-icons/"
echo "运行图片查看器: ./view-key-images.sh"

echo ""
echo "✅ 检查完成！" 