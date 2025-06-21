/**
 * 数据服务模块
 * 用于加载和处理JSON数据
 */

class DataService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 通用数据加载方法
   */
  async loadData(endpoint) {
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(endpoint, data);
      return data;
    } catch (error) {
      console.error(`Failed to load data from ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * 加载电影数据
   */
  async getMovies() {
    try {
      const data = await this.loadData('/data/processed/movies.json');
      return data.movies || [];
    } catch (error) {
      console.error('Failed to load movies data:', error);
      return [];
    }
  }

  /**
   * 加载台词数据
   */
  async getDialogues() {
    try {
      const data = await this.loadData('/data/processed/dialogues.json');
      return data.dialogues || [];
    } catch (error) {
      console.error('Failed to load dialogues data:', error);
      return [];
    }
  }

  /**
   * 加载词频数据
   */
  async getWordFrequency() {
    try {
      const data = await this.loadData('/data/processed/word_frequency.json');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to load word frequency data:', error);
      return [];
    }
  }

  /**
   * 加载统计数据
   */
  async getStatistics() {
    try {
      const data = await this.loadData('/data/processed/statistics.json');
      return data;
    } catch (error) {
      console.error('Failed to load statistics data:', error);
      return {
        totalMovies: 0,
        yearRange: { min: 0, max: 0 },
        durationStats: { average: 0, min: 0, max: 0 },
        genreDistribution: {},
        directorStats: []
      };
    }
  }

  /**
   * 加载图片索引
   */
  async getImages() {
    try {
      const data = await this.loadData('/data/processed/images.json');
      return data.images || {};
    } catch (error) {
      console.error('Failed to load images data:', error);
      return {};
    }
  }

  /**
   * 根据ID获取单个电影信息
   */
  async getMovieById(id) {
    const movies = await this.getMovies();
    return movies.find(movie => movie.id === parseInt(id));
  }

  /**
   * 获取电影的词频数据
   */
  async getMovieWordFrequency(movieId) {
    const wordFreqData = await this.getWordFrequency();
    return wordFreqData.find(data => data.movieId === parseInt(movieId));
  }

  /**
   * 获取首页统计图表数据
   */
  async getChartData() {
    const [movies, statistics] = await Promise.all([
      this.getMovies(),
      this.getStatistics()
    ]);

    return {
      // 时长分布数据
      durationDistribution: this.generateDurationDistribution(movies),
      
      // 年代分布数据
      yearDistribution: this.generateYearDistribution(movies),
      
      // 类型分布数据
      genreDistribution: statistics.genreDistribution,
      
      // 评分分布数据
      ratingDistribution: this.generateRatingDistribution(movies),
      
      // 导演作品数量数据
      directorStats: statistics.directorStats,
      
      // 时长趋势数据
      durationTrend: this.generateDurationTrend(movies)
    };
  }

  /**
   * 生成时长分布数据
   */
  generateDurationDistribution(movies) {
    const ranges = [
      { label: '60-90分钟', min: 60, max: 90 },
      { label: '90-120分钟', min: 90, max: 120 },
      { label: '120-150分钟', min: 120, max: 150 },
      { label: '150分钟以上', min: 150, max: Infinity }
    ];

    return ranges.map(range => ({
      name: range.label,
      value: movies.filter(movie => 
        movie.duration >= range.min && movie.duration < range.max
      ).length
    }));
  }

  /**
   * 生成年代分布数据
   */
  generateYearDistribution(movies) {
    const decades = {};
    
    movies.forEach(movie => {
      if (movie.year) {
        const decade = Math.floor(movie.year / 10) * 10;
        const key = `${decade}年代`;
        decades[key] = (decades[key] || 0) + 1;
      }
    });

    return Object.entries(decades).map(([name, value]) => ({
      name,
      value
    }));
  }

  /**
   * 生成评分分布数据
   */
  generateRatingDistribution(movies) {
    const ranges = [
      { label: '7.0-7.5', min: 7.0, max: 7.5 },
      { label: '7.5-8.0', min: 7.5, max: 8.0 },
      { label: '8.0-8.5', min: 8.0, max: 8.5 },
      { label: '8.5-9.0', min: 8.5, max: 9.0 },
      { label: '9.0以上', min: 9.0, max: 10.0 }
    ];

    return ranges.map(range => ({
      name: range.label,
      value: movies.filter(movie => 
        movie.rating >= range.min && movie.rating < range.max
      ).length
    }));
  }

  /**
   * 生成时长趋势数据
   */
  generateDurationTrend(movies) {
    const yearlyData = {};
    
    movies.forEach(movie => {
      if (movie.year && movie.duration) {
        if (!yearlyData[movie.year]) {
          yearlyData[movie.year] = { total: 0, count: 0 };
        }
        yearlyData[movie.year].total += movie.duration;
        yearlyData[movie.year].count += 1;
      }
    });

    return Object.entries(yearlyData)
      .map(([year, data]) => ({
        year: parseInt(year),
        averageDuration: Math.round(data.total / data.count)
      }))
      .sort((a, b) => a.year - b.year);
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }
}

// 创建单例实例
const dataService = new DataService();

export default dataService; 