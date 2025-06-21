import * as XLSX from 'xlsx';

class RiverDataService {
  constructor() {
    this.cachedData = null;
    this.lastFetchTime = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存
  }

  // 读取Excel文件
  async readExcelFile(filePath) {
    try {
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 转换为JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      return jsonData;
    } catch (error) {
      console.error('读取Excel文件失败:', error);
      throw new Error(`无法读取Excel文件: ${error.message}`);
    }
  }

  // 处理河流图数据
  processRiverData(rawData) {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    // 数据预处理和转换
    return rawData.map((item, index) => ({
      id: item.id || index,
      name: item.name || item.title || `数据项${index + 1}`,
      value: parseFloat(item.value) || Math.random() * 100,
      timestamp: item.timestamp || item.time || new Date().toISOString(),
      category: item.category || item.type || 'default',
      // 额外的元数据
      metadata: {
        source: item.source || 'unknown',
        status: item.status || 'active',
        priority: item.priority || 'medium'
      }
    }));
  }

  // 生成武侠电影数据
  generateWuxiaMovieData() {
    const movies = [
      { name: '龙门客栈', year: 1967, rating: 8.5, genre: '门派', influence: 95 },
      { name: '独臂刀', year: 1967, rating: 8.2, genre: '武功', influence: 88 },
      { name: '大醉侠', year: 1966, rating: 8.0, genre: '精神', influence: 82 },
      { name: '侠女', year: 1971, rating: 8.8, genre: '门派', influence: 92 },
      { name: '天涯明月刀', year: 1976, rating: 8.3, genre: '武功', influence: 85 },
      { name: '楚留香', year: 1977, rating: 8.1, genre: '精神', influence: 80 },
      { name: '倚天屠龙记', year: 1978, rating: 8.4, genre: '门派', influence: 87 },
      { name: '射雕英雄传', year: 1983, rating: 8.6, genre: '门派', influence: 90 },
      { name: '笑傲江湖', year: 1990, rating: 8.7, genre: '精神', influence: 93 },
      { name: '东方不败', year: 1992, rating: 8.9, genre: '武功', influence: 96 },
      { name: '新龙门客栈', year: 1992, rating: 8.8, genre: '门派', influence: 94 },
      { name: '白发魔女传', year: 1993, rating: 8.2, genre: '精神', influence: 83 },
      { name: '东邪西毒', year: 1994, rating: 8.5, genre: '精神', influence: 89 },
      { name: '刀', year: 1995, rating: 8.1, genre: '武功', influence: 81 },
      { name: '大话西游', year: 1995, rating: 9.2, genre: '精神', influence: 98 },
      { name: '风云雄霸天下', year: 1998, rating: 8.0, genre: '武功', influence: 78 },
      { name: '卧虎藏龙', year: 2000, rating: 8.6, genre: '门派', influence: 91 },
      { name: '英雄', year: 2002, rating: 8.3, genre: '精神', influence: 86 },
      { name: '十面埋伏', year: 2004, rating: 8.1, genre: '武功', influence: 79 },
      { name: '无极', year: 2005, rating: 6.8, genre: '精神', influence: 65 },
      { name: '满城尽带黄金甲', year: 2006, rating: 7.2, genre: '门派', influence: 70 },
      { name: '投名状', year: 2007, rating: 8.0, genre: '精神', influence: 77 },
      { name: '赤壁', year: 2008, rating: 7.8, genre: '门派', influence: 75 },
      { name: '叶问', year: 2008, rating: 8.4, genre: '武功', influence: 88 },
      { name: '剑雨', year: 2010, rating: 8.2, genre: '精神', influence: 84 },
      { name: '龙门飞甲', year: 2011, rating: 7.9, genre: '门派', influence: 76 },
      { name: '一代宗师', year: 2013, rating: 8.5, genre: '武功', influence: 90 },
      { name: '绣春刀', year: 2014, rating: 8.1, genre: '门派', influence: 82 },
      { name: '师父', year: 2015, rating: 8.0, genre: '武功', influence: 78 }
    ];

    return movies.map((movie, index) => ({
      id: `movie_${index}`,
      name: movie.name,
      year: movie.year,
      rating: movie.rating,
      genre: movie.genre,
      influence: movie.influence,
      timestamp: new Date(movie.year, 0, 1).toISOString(),
      category: movie.genre,
      value: movie.influence,
      metadata: {
        source: 'wuxia_database',
        status: 'active',
        priority: movie.rating > 8.5 ? 'high' : movie.rating > 8.0 ? 'medium' : 'low'
      }
    }));
  }

  // 获取河流图数据
  async getRiverData() {
    // 检查缓存
    const now = Date.now();
    if (this.cachedData && this.lastFetchTime && (now - this.lastFetchTime) < this.cacheExpiry) {
      return this.cachedData;
    }

    try {
      // 直接使用武侠电影数据，不再尝试读取Excel文件
      const rawData = this.generateWuxiaMovieData();

      // 缓存数据
      this.cachedData = rawData;
      this.lastFetchTime = now;

      return rawData;
    } catch (error) {
      console.error('获取河流图数据失败:', error);
      throw error;
    }
  }

  // 获取河流图详情数据
  async getRiverDetailData(id) {
    try {
      const riverData = await this.getRiverData();
      
      // 查找指定ID的数据项
      const dataItem = riverData.find(item => item.id === id);
      
      if (!dataItem) {
        throw new Error(`未找到ID为 ${id} 的数据项`);
      }

      // 生成详情页数据
      const detailData = {
        ...dataItem,
        title: dataItem.name,
        lastUpdated: new Date().toLocaleString('zh-CN'),
        status: dataItem.metadata?.status || 'active',
        
        // 生成图表数据
        chartData: this.generateChartData(dataItem),
        
        // 生成关键指标
        metrics: this.generateMetrics(dataItem),
        
        // 生成表格数据
        tableData: this.generateTableData(dataItem),
        tableColumns: [
          { key: 'timestamp', title: '时间', width: 150 },
          { key: 'value', title: '数值', width: 100 },
          { key: 'change', title: '变化', width: 100 },
          { key: 'status', title: '状态', width: 80 }
        ]
      };

      return detailData;
    } catch (error) {
      console.error('获取河流图详情数据失败:', error);
      throw error;
    }
  }

  // 生成图表数据
  generateChartData(baseItem) {
    const chartData = [];
    const now = new Date();
    
    // 生成过去7天的趋势数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const baseValue = baseItem.value;
      const dailyVariation = (Math.random() - 0.5) * baseValue * 0.3;
      
      chartData.push({
        timestamp: date.toISOString(),
        value: Math.max(0, baseValue + dailyVariation),
        label: date.toLocaleDateString('zh-CN')
      });
    }
    
    return chartData;
  }

  // 生成关键指标
  generateMetrics(baseItem) {
    const baseValue = baseItem.value;
    
    return [
      {
        label: '当前值',
        value: baseValue.toFixed(2)
      },
      {
        label: '日增长率',
        value: `${((Math.random() - 0.5) * 10).toFixed(1)}%`
      },
      {
        label: '周平均值',
        value: (baseValue * (0.9 + Math.random() * 0.2)).toFixed(2)
      },
      {
        label: '峰值',
        value: (baseValue * (1.2 + Math.random() * 0.3)).toFixed(2)
      },
      {
        label: '最低值',
        value: (baseValue * (0.5 + Math.random() * 0.3)).toFixed(2)
      }
    ];
  }

  // 生成表格数据
  generateTableData(baseItem) {
    const tableData = [];
    const now = new Date();
    
    // 生成过去24小时的数据
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const value = baseItem.value * (0.8 + Math.random() * 0.4);
      const previousValue = baseItem.value * (0.8 + Math.random() * 0.4);
      const change = value - previousValue;
      
      tableData.push({
        timestamp: timestamp.toLocaleString('zh-CN'),
        value: value.toFixed(2),
        change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
        status: change >= 0 ? '上升' : '下降'
      });
    }
    
    return tableData;
  }

  // 获取统计数据
  async getStatistics(timeRange = 'all', categories = []) {
    try {
      const riverData = await this.getRiverData();
      
      // 根据条件过滤数据
      let filteredData = riverData;
      
      if (timeRange !== 'all') {
        const now = new Date();
        const timeOffset = {
          '1h': 1 * 60 * 60 * 1000,
          '6h': 6 * 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000
        };
        
        if (timeOffset[timeRange]) {
          const cutoff = new Date(now.getTime() - timeOffset[timeRange]);
          filteredData = filteredData.filter(d => new Date(d.timestamp) >= cutoff);
        }
      }
      
      if (categories.length > 0) {
        filteredData = filteredData.filter(d => categories.includes(d.category));
      }
      
      // 计算统计信息
      const stats = {
        total: filteredData.length,
        totalValue: filteredData.reduce((sum, item) => sum + item.value, 0),
        averageValue: filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length : 0,
        maxValue: Math.max(...filteredData.map(item => item.value)),
        minValue: Math.min(...filteredData.map(item => item.value)),
        categories: [...new Set(filteredData.map(item => item.category))],
        activeCount: filteredData.filter(item => item.metadata?.status === 'active').length,
        inactiveCount: filteredData.filter(item => item.metadata?.status === 'inactive').length
      };
      
      return stats;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw error;
    }
  }

  // 清除缓存
  clearCache() {
    this.cachedData = null;
    this.lastFetchTime = null;
  }
}

// 创建单例实例
export const riverDataService = new RiverDataService();

// 导出服务类
export default RiverDataService; 