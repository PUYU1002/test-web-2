/**
 * 背景图片管理服务
 * 根据电影数据索引动态加载对应的背景图片
 */

// 背景图片映射表 - 根据需求文档，背景图名称与数据下标对应
const backgroundMapping = {
  1: '1.png',
  2: '2.png', 
  3: '3.png',
  4: '4.png',
  5: '5.png',
  6: '6.png',
  7: '7.png',
  8: '8.png',
  9: '9.png',
  10: '10.png',
  11: '11.png',
  12: '12.png',
  13: '13.png',
  14: '14.png',
  15: '15.png',
  // 注意：第16部电影被排除，所以跳过16
  17: '17.png',
  18: '18.png',
  19: '19.png',
  20: '20.png',
  21: '21.png',
  22: '22.png',
  23: '23.png',
  24: '24.png',
  25: '25.png',
  26: '26.png',
  27: '27.png',
  28: '28.png',
  29: '29.png',
  30: '30.png',
  31: '31.png',
  32: '32.png',
  33: '33.png',
  34: '34.png',
  35: '35.png',
  36: '36.png',
  37: '37.png',
  38: '38.png',
  39: '39.png',
  40: '40.png',
  41: '41.png',
  42: '42.png',
  43: '43.png',
  44: '44.png',
  45: '45.png',
  46: '46.png',
  47: '47.png',
  48: '48.png'
};

// 武侠电影数据 - 47部电影（排除第16部）
const wuxiaMoviesData = [
  { id: 1, title: '龙门客栈', year: 1967, index: 1 },
  { id: 2, title: '独臂刀', year: 1967, index: 2 },
  { id: 3, title: '大醉侠', year: 1966, index: 3 },
  { id: 4, title: '侠女', year: 1971, index: 4 },
  { id: 5, title: '天涯明月刀', year: 1976, index: 5 },
  { id: 6, title: '楚留香', year: 1977, index: 6 },
  { id: 7, title: '倚天屠龙记', year: 1978, index: 7 },
  { id: 8, title: '射雕英雄传', year: 1983, index: 8 },
  { id: 9, title: '笑傲江湖', year: 1990, index: 9 },
  { id: 10, title: '东方不败', year: 1992, index: 10 },
  { id: 11, title: '新龙门客栈', year: 1992, index: 11 },
  { id: 12, title: '白发魔女传', year: 1993, index: 12 },
  { id: 13, title: '东邪西毒', year: 1994, index: 13 },
  { id: 14, title: '刀', year: 1995, index: 14 },
  { id: 15, title: '大话西游', year: 1995, index: 15 },
  // 第16部电影被排除
  { id: 17, title: '风云雄霸天下', year: 1998, index: 17 },
  { id: 18, title: '卧虎藏龙', year: 2000, index: 18 },
  { id: 19, title: '英雄', year: 2002, index: 19 },
  { id: 20, title: '十面埋伏', year: 2004, index: 20 },
  { id: 21, title: '叶问', year: 2008, index: 21 },
  { id: 22, title: '一代宗师', year: 2013, index: 22 },
  { id: 23, title: '绣春刀', year: 2014, index: 23 },
  { id: 24, title: '师父', year: 2015, index: 24 },
  { id: 25, title: '剑雨', year: 2010, index: 25 },
  { id: 26, title: '武侠', year: 2011, index: 26 },
  { id: 27, title: '太极张三丰', year: 1993, index: 27 },
  { id: 28, title: '黄飞鸿', year: 1991, index: 28 },
  { id: 29, title: '方世玉', year: 1993, index: 29 },
  { id: 30, title: '少林寺', year: 1982, index: 30 },
  { id: 31, title: '少林三十六房', year: 1978, index: 31 },
  { id: 32, title: '醉拳', year: 1978, index: 32 },
  { id: 33, title: '蛇形刁手', year: 1978, index: 33 },
  { id: 34, title: '如来神掌', year: 1982, index: 34 },
  { id: 35, title: '神雕侠侣', year: 1983, index: 35 },
  { id: 36, title: '鹿鼎记', year: 1992, index: 36 },
  { id: 37, title: '武状元苏乞儿', year: 1992, index: 37 },
  { id: 38, title: '功夫', year: 2004, index: 38 },
  { id: 39, title: '霍元甲', year: 2006, index: 39 },
  { id: 40, title: '叶问2', year: 2010, index: 40 },
  { id: 41, title: '叶问3', year: 2015, index: 41 },
  { id: 42, title: '武林外传', year: 2011, index: 42 },
  { id: 43, title: '新少林寺', year: 2011, index: 43 },
  { id: 44, title: '太极1从零开始', year: 2012, index: 44 },
  { id: 45, title: '太极2英雄崛起', year: 2012, index: 45 },
  { id: 46, title: '绣春刀2修罗战场', year: 2017, index: 46 },
  { id: 47, title: '影', year: 2018, index: 47 },
  { id: 48, title: '无双', year: 2018, index: 48 }
];

/**
 * 获取背景图片URL
 * @param {number} movieIndex - 电影索引（1-48，排除16）
 * @returns {string|null} 背景图片的URL
 */
export const getBackgroundImage = (movieIndex) => {
  const imageName = backgroundMapping[movieIndex];
  if (!imageName) {
    console.warn(`未找到索引 ${movieIndex} 对应的背景图片`);
    return null;
  }
  
  try {
    // 使用动态import来加载图片
    return `/assets/images/backgrounds/${imageName}`;
  } catch (error) {
    console.error(`加载背景图片失败: ${imageName}`, error);
    return null;
  }
};

/**
 * 获取电影数据
 * @param {number} movieId - 电影ID
 * @returns {object|null} 电影数据对象
 */
export const getMovieData = (movieId) => {
  return wuxiaMoviesData.find(movie => movie.id === movieId) || null;
};

/**
 * 获取所有电影数据
 * @returns {array} 所有电影数据数组
 */
export const getAllMoviesData = () => {
  return wuxiaMoviesData;
};

/**
 * 根据电影ID获取对应的背景图片
 * @param {number} movieId - 电影ID
 * @returns {string|null} 背景图片URL
 */
export const getMovieBackground = (movieId) => {
  const movie = getMovieData(movieId);
  if (!movie) {
    console.warn(`未找到ID为 ${movieId} 的电影数据`);
    return null;
  }
  
  return getBackgroundImage(movie.index);
};

/**
 * 预加载所有背景图片
 * @returns {Promise} 预加载Promise
 */
export const preloadBackgrounds = async () => {
  const loadPromises = Object.values(backgroundMapping).map(imageName => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(imageName);
      img.onerror = () => reject(new Error(`Failed to load ${imageName}`));
      
      img.src = `/assets/images/backgrounds/${imageName}`;
    });
  });
  
  try {
    await Promise.all(loadPromises);
    console.log('所有背景图片预加载完成');
  } catch (error) {
    console.error('背景图片预加载失败:', error);
  }
};

/**
 * 获取随机背景图片
 * @returns {string|null} 随机背景图片URL
 */
export const getRandomBackground = () => {
  const movieIds = wuxiaMoviesData.map(movie => movie.id);
  const randomId = movieIds[Math.floor(Math.random() * movieIds.length)];
  return getMovieBackground(randomId);
};

/**
 * 根据年份筛选电影并获取对应背景
 * @param {number} startYear - 开始年份
 * @param {number} endYear - 结束年份
 * @returns {array} 筛选后的电影背景数据
 */
export const getBackgroundsByYearRange = (startYear, endYear) => {
  return wuxiaMoviesData
    .filter(movie => movie.year >= startYear && movie.year <= endYear)
    .map(movie => ({
      ...movie,
      backgroundUrl: getBackgroundImage(movie.index)
    }));
};

export default {
  getBackgroundImage,
  getMovieData,
  getAllMoviesData,
  getMovieBackground,
  preloadBackgrounds,
  getRandomBackground,
  getBackgroundsByYearRange
};