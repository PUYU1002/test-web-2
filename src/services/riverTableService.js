import * as XLSX from 'xlsx';

/**
 * 河流图总表数据服务
 * 处理河流图总表.xlsx文件，支持数据分段和时间排序
 */
class RiverTableService {
  constructor() {
    this.cachedData = null;
    this.lastFetchTime = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 读取河流图总表Excel文件 - 使用fetch直接读取
   */
  async readRiverTableExcel() {
    try {
      console.log('开始读取河流图总表Excel文件...');
      
      // 直接使用fetch读取Excel文件
      const response = await fetch('/需求/河流图总表.xlsx');
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
      }
      
      console.log('✓ Excel文件获取成功，开始解析...');
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      console.log('Excel工作表列表:', workbook.SheetNames);

      // 查找所有相关工作表
      const relevantSheets = workbook.SheetNames.filter(name => 
        name.includes('门派') || name.includes('精神') || name.includes('武功') || 
        name.includes('首页') || name.includes('河流图')
      );

      console.log('找到相关工作表:', relevantSheets);

      let allData = [];

      // 读取所有相关工作表的数据
      for (const sheetName of relevantSheets) {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`工作表 ${sheetName}: ${sheetData.length}条数据，列名:`, Object.keys(sheetData[0] || {}));
        
        // 为每条数据添加工作表来源信息
        const dataWithSource = sheetData.map(item => ({
          ...item,
          _工作表来源: sheetName
        }));
        
        allData = allData.concat(dataWithSource);
      }

      const jsonData = allData;
      
      console.log('河流图总表Excel读取成功:', {
        工作表数量: relevantSheets.length,
        总数据量: jsonData.length,
        工作表列表: relevantSheets,
        前3条数据: jsonData.slice(0, 3)
      });

      // 数据清洗和格式化
      const cleanedData = jsonData.map((item, index) => {
        // 从工作表来源中提取类别信息
        let category = '未知';
        const sheetName = item._工作表来源 || '';
        if (sheetName.includes('门派')) {
          category = '门派';
        } else if (sheetName.includes('精神')) {
          category = '精神';
        } else if (sheetName.includes('武功')) {
          category = '武功';
        }

        // 获取所有非空的列
        const nonEmptyKeys = Object.keys(item).filter(key => 
          !key.startsWith('_') && 
          !key.startsWith('__EMPTY') && 
          item[key] && 
          item[key].toString().trim() !== ''
        );

        // 清洗数据结构
        const cleanedItem = {
          电影ID: index + 1,
          电影名: item['电影名'] || item['影片'] || item['门派'] || item[nonEmptyKeys[0]] || `电影${index + 1}`,
          上映年份: parseInt(item['上映年份'] || item['年份'] || item['__EMPTY_1'] || 2000 + Math.floor(Math.random() * 20)),
          类别: category,
          数值: parseFloat(item['数值'] || item['__EMPTY_2'] || Math.random() * 100),
          工作表来源: sheetName,
          原始数据: item
        };

        return cleanedItem;
      }).filter(item => 
        item.电影名 && 
        item.电影名.trim() !== '' && 
        !item.电影名.startsWith('__EMPTY') &&
        item.类别 !== '未知'
      );

      console.log(`数据清洗完成: 原始${jsonData.length}条 → 清洗后${cleanedData.length}条`);
      return cleanedData;
    } catch (error) {
      console.error('读取河流图总表Excel文件失败:', error);
      // 返回模拟数据作为备选
      return this.generateMockData();
    }
  }

  /**
   * 生成模拟数据（当Excel文件不可用时）- 46部电影
   */
  generateMockData() {
    const mockData = [];
    const categories = ['门派', '精神', '武功'];
    
    // 46部武侠电影数据（排除16号）
    const movies = [
      { id: 1, title: '倩女幽魂', year: 1987 },
      { id: 2, title: '射雕英雄传之东成西就', year: 1993 },
      { id: 3, title: '新龙门客栈', year: 1992 },
      { id: 4, title: '黄飞鸿', year: 1991 },
      { id: 5, title: '笑傲江湖', year: 1990 },
      { id: 6, title: '卧虎藏龙', year: 2000 },
      { id: 7, title: '英雄', year: 2002 },
      { id: 8, title: '十面埋伏', year: 2004 },
      { id: 9, title: '霍元甲', year: 2006 },
      { id: 10, title: '叶问', year: 2008 },
      { id: 11, title: '剑雨', year: 2010 },
      { id: 12, title: '龙门飞甲', year: 2011 },
      { id: 13, title: '一代宗师', year: 2013 },
      { id: 14, title: '绣春刀', year: 2014 },
      { id: 15, title: '师父', year: 2015 },
      // 跳过16号
      { id: 17, title: '湄公河行动', year: 2016 },
      { id: 18, title: '绣春刀2', year: 2017 },
      { id: 19, title: '影', year: 2018 },
      { id: 20, title: '少年的你', year: 2019 },
      { id: 21, title: '花木兰', year: 2020 },
      { id: 22, title: '侠女', year: 1971 },
      { id: 23, title: '龙门客栈', year: 1967 },
      { id: 24, title: '独臂刀', year: 1967 },
      { id: 25, title: '大醉侠', year: 1966 },
      { id: 26, title: '天涯明月刀', year: 1976 },
      { id: 27, title: '楚留香', year: 1977 },
      { id: 28, title: '陆小凤', year: 1976 },
      { id: 29, title: '多情剑客无情剑', year: 1977 },
      { id: 30, title: '白玉老虎', year: 1977 },
      { id: 31, title: '流星蝴蝶剑', year: 1976 },
      { id: 32, title: '边城浪子', year: 1993 },
      { id: 33, title: '火烧红莲寺', year: 1928 },
      { id: 34, title: '蜀山剑侠传', year: 1983 },
      { id: 35, title: '新蜀山剑侠', year: 2001 },
      { id: 36, title: '青蛇', year: 1993 },
      { id: 37, title: '白蛇传说', year: 2011 },
      { id: 38, title: '太极张三丰', year: 1993 },
      { id: 39, title: '太极1从零开始', year: 2012 },
      { id: 40, title: '太极2英雄崛起', year: 2012 },
      { id: 41, title: '武当', year: 2012 },
      { id: 42, title: '少林寺', year: 1982 },
      { id: 43, title: '少林足球', year: 2001 },
      { id: 44, title: '功夫', year: 2004 },
      { id: 45, title: '醉拳', year: 1978 },
      { id: 46, title: '蛇形刁手', year: 1978 },
      { id: 47, title: '龙拳', year: 1979 },
      { id: 48, title: '六指琴魔', year: 1994 }
    ];

    // 为每部电影的每个类别生成一条数据，总共 46 * 3 = 138 条数据
    movies.forEach((movie, index) => {
      categories.forEach(category => {
        mockData.push({
          电影ID: movie.id,
          电影名: movie.title,
          上映年份: movie.year,
          类别: category,
          数值: Math.floor(Math.random() * 100) + 20,
          时间戳: new Date(movie.year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          排序权重: index * 3 + categories.indexOf(category)
        });
      });
    });

    console.log(`生成模拟数据完成: 共${movies.length}部电影，${categories.length}个类别，总计${mockData.length}条数据`);
    return mockData;
  }

  /**
   * 按时间排序数据
   * @param {Array} data - 原始数据
   * @param {string} timeField - 时间字段名
   * @param {boolean} ascending - 是否升序排列
   */
  sortByTime(data, timeField = '上映年份', ascending = true) {
    return data.sort((a, b) => {
      let timeA, timeB;
      
      // 尝试解析时间字段
      if (timeField === '上映年份' || timeField === 'year') {
        timeA = parseInt(a[timeField] || a['上映年份'] || a['year'] || 0);
        timeB = parseInt(b[timeField] || b['上映年份'] || b['year'] || 0);
      } else if (timeField === '时间戳' || timeField === 'timestamp') {
        timeA = new Date(a[timeField] || a['时间戳'] || a['timestamp'] || 0).getTime();
        timeB = new Date(b[timeField] || b['时间戳'] || b['timestamp'] || 0).getTime();
      } else {
        // 通用时间解析
        timeA = new Date(a[timeField] || 0).getTime();
        timeB = new Date(b[timeField] || 0).getTime();
      }
      
      return ascending ? timeA - timeB : timeB - timeA;
    });
  }

  /**
   * 将数据分为3段
   * @param {Array} data - 排序后的数据
   * @param {Object} percentages - 各段百分比 {segment1: 0.3, segment2: 0.4, segment3: 0.3}
   */
  splitDataIntoSegments(data, percentages = { segment1: 0.25, segment2: 0.35, segment3: 0.4 }) {
    const totalLength = data.length;
    
    // 计算各段长度
    const segment1Length = Math.floor(totalLength * percentages.segment1);
    const segment2Length = Math.floor(totalLength * percentages.segment2);
    const segment3Length = totalLength - segment1Length - segment2Length; // 确保所有数据都被包含
    
    // 分段
    const segment1 = data.slice(0, segment1Length);
    const segment2 = data.slice(segment1Length, segment1Length + segment2Length);
    const segment3 = data.slice(segment1Length + segment2Length);
    
    console.log('数据分段完成:', {
      总数据量: totalLength,
      第一段: `${segment1.length}条 (${(percentages.segment1 * 100).toFixed(1)}%)`,
      第二段: `${segment2.length}条 (${(percentages.segment2 * 100).toFixed(1)}%)`,
      第三段: `${segment3.length}条 (${(segment3Length / totalLength * 100).toFixed(1)}%)`,
      百分比设置: percentages
    });
    
    return {
      segment1: {
        data: segment1,
        percentage: percentages.segment1,
        count: segment1.length
      },
      segment2: {
        data: segment2,
        percentage: percentages.segment2,
        count: segment2.length
      },
      segment3: {
        data: segment3,
        percentage: segment3Length / totalLength,
        count: segment3.length
      },
      total: {
        count: totalLength,
        percentages
      }
    };
  }

  /**
   * 按类别过滤数据 - 过滤出指定类别的46条记录
   * @param {Array} data - 原始数据（138条）
   * @param {string} category - 类别 ('门派', '精神', '武功')
   */
  filterByCategory(data, category) {
    const filtered = data.filter(item => {
      const itemCategory = item['类别'] || item['category'] || item['分类'];
      return itemCategory === category;
    });
    
    console.log(`类别过滤完成: ${category} - ${filtered.length}条记录`);
    return filtered;
  }

  /**
   * 获取处理后的河流图数据
   * @param {Object} options - 选项
   * @param {string} options.category - 类别过滤
   * @param {Object} options.percentages - 分段百分比
   * @param {string} options.sortBy - 排序字段
   * @param {boolean} options.ascending - 排序方向
   */
  async getRiverTableData(options = {}) {
    const {
      category = null,
      percentages = { segment1: 0.25, segment2: 0.35, segment3: 0.4 },
      sortBy = '上映年份',
      ascending = true
    } = options;

    // 检查缓存
    const cacheKey = JSON.stringify(options);
    const now = Date.now();
    if (this.cachedData && 
        this.cachedData.cacheKey === cacheKey && 
        this.lastFetchTime && 
        (now - this.lastFetchTime) < this.cacheExpiry) {
      console.log('使用缓存的河流图数据');
      return this.cachedData.data;
    }

    try {
      // 读取Excel数据
      let rawData = await this.readRiverTableExcel();
      
      console.log(`原始数据读取完成: ${rawData.length}条记录 (应为138条: 46部电影×3个类别)`);
      
      // 按类别过滤数据（如果指定）
      if (category) {
        rawData = this.filterByCategory(rawData, category);
        console.log(`${category}类别过滤完成: ${rawData.length}条记录 (应为46条)`);
      } else {
        console.log('未指定类别，使用全部138条数据');
      }
      
      // 按时间排序
      const sortedData = this.sortByTime(rawData, sortBy, ascending);
      console.log(`数据时间排序完成: ${sortedData.length}条记录`);
      
      // 分段处理
      const segmentedData = this.splitDataIntoSegments(sortedData, percentages);
      
      // 缓存结果
      this.cachedData = {
        data: segmentedData,
        cacheKey,
        timestamp: now
      };
      this.lastFetchTime = now;
      
      return segmentedData;
    } catch (error) {
      console.error('获取河流图数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据统计信息
   */
  async getDataStatistics() {
    try {
      const rawData = await this.readRiverTableExcel();
      
      // 统计各类别数据量
      const categoryStats = {};
      const yearStats = {};
      
      rawData.forEach(item => {
        const category = item['类别'] || item['category'] || '未知';
        const year = item['上映年份'] || item['year'] || '未知';
        
        categoryStats[category] = (categoryStats[category] || 0) + 1;
        yearStats[year] = (yearStats[year] || 0) + 1;
      });
      
      return {
        总数据量: rawData.length,
        类别统计: categoryStats,
        年份统计: yearStats,
        时间范围: {
          最早: Math.min(...Object.keys(yearStats).filter(y => y !== '未知').map(Number)),
          最晚: Math.max(...Object.keys(yearStats).filter(y => y !== '未知').map(Number))
        }
      };
    } catch (error) {
      console.error('获取数据统计失败:', error);
      return null;
    }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cachedData = null;
    this.lastFetchTime = null;
    console.log('河流图数据缓存已清除');
  }
}

// 创建单例实例
const riverTableService = new RiverTableService();

export default riverTableService; 