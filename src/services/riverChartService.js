/**
 * 河流图数据服务
 * 基于Excel数据实现门派、武功、侠义精神三个维度的河流图
 */

// 模拟从Excel文件中读取的河流图数据
// 实际项目中应该从 ../需求/河流图总表.xlsx 读取
const riverChartData = {
  // 门派维度数据
  sect: [
    {
      movieId: 1,
      title: '龙门客栈',
      year: 1967,
      categories: {
        '武当派': { value: 85, color: '#d4af37' },
        '少林派': { value: 70, color: '#cd853f' },
        '峨眉派': { value: 45, color: '#daa520' }
      }
    },
    {
      movieId: 2,
      title: '独臂刀',
      year: 1967,
      categories: {
        '武当派': { value: 60, color: '#d4af37' },
        '少林派': { value: 90, color: '#cd853f' },
        '峨眉派': { value: 30, color: '#daa520' }
      }
    },
    {
      movieId: 3,
      title: '大醉侠',
      year: 1966,
      categories: {
        '武当派': { value: 75, color: '#d4af37' },
        '少林派': { value: 55, color: '#cd853f' },
        '峨眉派': { value: 65, color: '#daa520' }
      }
    },
    {
      movieId: 4,
      title: '侠女',
      year: 1971,
      categories: {
        '武当派': { value: 40, color: '#d4af37' },
        '少林派': { value: 35, color: '#cd853f' },
        '峨眉派': { value: 95, color: '#daa520' }
      }
    },
    {
      movieId: 5,
      title: '天涯明月刀',
      year: 1976,
      categories: {
        '武当派': { value: 80, color: '#d4af37' },
        '少林派': { value: 60, color: '#cd853f' },
        '峨眉派': { value: 50, color: '#daa520' }
      }
    }
  ],

  // 武功维度数据
  martialArts: [
    {
      movieId: 1,
      title: '龙门客栈',
      year: 1967,
      categories: {
        '内功心法': { value: 80, color: '#e53e3e' },
        '剑法招式': { value: 90, color: '#fc8181' },
        '轻功身法': { value: 70, color: '#f56565' }
      }
    },
    {
      movieId: 2,
      title: '独臂刀',
      year: 1967,
      categories: {
        '内功心法': { value: 65, color: '#e53e3e' },
        '剑法招式': { value: 95, color: '#fc8181' },
        '轻功身法': { value: 55, color: '#f56565' }
      }
    },
    {
      movieId: 3,
      title: '大醉侠',
      year: 1966,
      categories: {
        '内功心法': { value: 85, color: '#e53e3e' },
        '剑法招式': { value: 60, color: '#fc8181' },
        '轻功身法': { value: 80, color: '#f56565' }
      }
    },
    {
      movieId: 4,
      title: '侠女',
      year: 1971,
      categories: {
        '内功心法': { value: 70, color: '#e53e3e' },
        '剑法招式': { value: 85, color: '#fc8181' },
        '轻功身法': { value: 90, color: '#f56565' }
      }
    },
    {
      movieId: 5,
      title: '天涯明月刀',
      year: 1976,
      categories: {
        '内功心法': { value: 75, color: '#e53e3e' },
        '剑法招式': { value: 80, color: '#fc8181' },
        '轻功身法': { value: 65, color: '#f56565' }
      }
    }
  ],

  // 侠义精神维度数据
  chivalry: [
    {
      movieId: 1,
      title: '龙门客栈',
      year: 1967,
      categories: {
        '侠肝义胆': { value: 90, color: '#3182ce' },
        '除暴安良': { value: 85, color: '#63b3ed' },
        '扶危济困': { value: 75, color: '#4299e1' }
      }
    },
    {
      movieId: 2,
      title: '独臂刀',
      year: 1967,
      categories: {
        '侠肝义胆': { value: 80, color: '#3182ce' },
        '除暴安良': { value: 90, color: '#63b3ed' },
        '扶危济困': { value: 70, color: '#4299e1' }
      }
    },
    {
      movieId: 3,
      title: '大醉侠',
      year: 1966,
      categories: {
        '侠肝义胆': { value: 85, color: '#3182ce' },
        '除暴安良': { value: 70, color: '#63b3ed' },
        '扶危济困': { value: 80, color: '#4299e1' }
      }
    },
    {
      movieId: 4,
      title: '侠女',
      year: 1971,
      categories: {
        '侠肝义胆': { value: 95, color: '#3182ce' },
        '除暴安良': { value: 80, color: '#63b3ed' },
        '扶危济困': { value: 85, color: '#4299e1' }
      }
    },
    {
      movieId: 5,
      title: '天涯明月刀',
      year: 1976,
      categories: {
        '侠肝义胆': { value: 75, color: '#3182ce' },
        '除暴安良': { value: 85, color: '#63b3ed' },
        '扶危济困': { value: 90, color: '#4299e1' }
      }
    }
  ]
};

/**
 * 获取指定维度的河流图数据
 * @param {string} dimension - 维度类型 ('sect', 'martialArts', 'chivalry')
 * @returns {array} 河流图数据数组
 */
export const getRiverChartData = (dimension) => {
  if (!riverChartData[dimension]) {
    console.warn(`未找到维度 ${dimension} 的数据`);
    return [];
  }
  
  return riverChartData[dimension];
};

/**
 * 获取所有维度的河流图数据
 * @returns {object} 包含所有维度数据的对象
 */
export const getAllRiverChartData = () => {
  return riverChartData;
};

/**
 * 处理河流图数据，转换为D3可用的格式
 * @param {string} dimension - 维度类型
 * @returns {object} 处理后的数据对象
 */
export const processRiverChartData = (dimension) => {
  const rawData = getRiverChartData(dimension);
  if (!rawData || rawData.length === 0) {
    return { layers: [], categories: [], years: [] };
  }

  // 提取所有类别
  const categoriesSet = new Set();
  rawData.forEach(movie => {
    Object.keys(movie.categories).forEach(category => {
      categoriesSet.add(category);
    });
  });
  const categories = Array.from(categoriesSet);

  // 提取所有年份并排序
  const years = [...new Set(rawData.map(movie => movie.year))].sort();

  // 按年份分组数据
  const dataByYear = {};
  rawData.forEach(movie => {
    if (!dataByYear[movie.year]) {
      dataByYear[movie.year] = [];
    }
    dataByYear[movie.year].push(movie);
  });

  // 为每个类别创建数据层
  const layers = categories.map(category => {
    const layerData = years.map(year => {
      const yearMovies = dataByYear[year] || [];
      const categoryValues = yearMovies
        .filter(movie => movie.categories[category])
        .map(movie => movie.categories[category].value);
      
      const totalValue = categoryValues.reduce((sum, value) => sum + value, 0);
      const avgValue = categoryValues.length > 0 ? totalValue / categoryValues.length : 0;
      
      return {
        year,
        category,
        value: totalValue,
        avgValue,
        count: categoryValues.length,
        movies: yearMovies.filter(movie => movie.categories[category])
      };
    });

    return {
      category,
      data: layerData,
      color: rawData[0]?.categories[category]?.color || '#d4af37'
    };
  });

  return {
    layers,
    categories,
    years,
    rawData
  };
};

/**
 * 获取电影在指定维度下的最高值类别
 * @param {number} movieId - 电影ID
 * @param {string} dimension - 维度类型
 * @returns {object|null} 最高值类别信息
 */
export const getMovieTopCategory = (movieId, dimension) => {
  const data = getRiverChartData(dimension);
  const movie = data.find(m => m.movieId === movieId);
  
  if (!movie) {
    return null;
  }

  let topCategory = null;
  let maxValue = 0;

  Object.entries(movie.categories).forEach(([category, info]) => {
    if (info.value > maxValue) {
      maxValue = info.value;
      topCategory = {
        category,
        value: info.value,
        color: info.color
      };
    }
  });

  return topCategory;
};

/**
 * 获取维度标题映射
 * @returns {object} 维度标题映射对象
 */
export const getDimensionTitles = () => {
  return {
    sect: '门派河流图',
    martialArts: '武功河流图',
    chivalry: '侠义精神河流图'
  };
};

/**
 * 获取维度颜色方案
 * @returns {object} 维度颜色方案对象
 */
export const getDimensionColorSchemes = () => {
  return {
    sect: {
      primary: '#d4af37',
      secondary: '#cd853f',
      gradient: ['#8b4513', '#d4af37', '#f6e05e']
    },
    martialArts: {
      primary: '#e53e3e',
      secondary: '#fc8181',
      gradient: ['#742a2a', '#e53e3e', '#fc8181']
    },
    chivalry: {
      primary: '#3182ce',
      secondary: '#63b3ed',
      gradient: ['#2c5282', '#3182ce', '#63b3ed']
    }
  };
};

/**
 * 根据年份范围筛选河流图数据
 * @param {string} dimension - 维度类型
 * @param {number} startYear - 开始年份
 * @param {number} endYear - 结束年份
 * @returns {array} 筛选后的数据
 */
export const filterRiverDataByYear = (dimension, startYear, endYear) => {
  const data = getRiverChartData(dimension);
  return data.filter(movie => movie.year >= startYear && movie.year <= endYear);
};

/**
 * 获取河流图统计信息
 * @param {string} dimension - 维度类型
 * @returns {object} 统计信息对象
 */
export const getRiverChartStats = (dimension) => {
  const data = getRiverChartData(dimension);
  
  if (!data || data.length === 0) {
    return {
      totalMovies: 0,
      yearRange: { start: 0, end: 0 },
      categories: [],
      avgValues: {}
    };
  }

  const years = data.map(movie => movie.year);
  const yearRange = {
    start: Math.min(...years),
    end: Math.max(...years)
  };

  const categoriesSet = new Set();
  const categoryValues = {};

  data.forEach(movie => {
    Object.entries(movie.categories).forEach(([category, info]) => {
      categoriesSet.add(category);
      if (!categoryValues[category]) {
        categoryValues[category] = [];
      }
      categoryValues[category].push(info.value);
    });
  });

  const categories = Array.from(categoriesSet);
  const avgValues = {};
  
  categories.forEach(category => {
    const values = categoryValues[category];
    avgValues[category] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });

  return {
    totalMovies: data.length,
    yearRange,
    categories,
    avgValues
  };
};

export default {
  getRiverChartData,
  getAllRiverChartData,
  processRiverChartData,
  getMovieTopCategory,
  getDimensionTitles,
  getDimensionColorSchemes,
  filterRiverDataByYear,
  getRiverChartStats
}; 