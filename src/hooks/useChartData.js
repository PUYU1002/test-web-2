import { useState, useEffect, useMemo } from 'react';
import dataService from '../services/dataService';

/**
 * 图表数据管理Hook
 */
export const useChartData = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataService.getChartData();
        setChartData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  return { chartData, loading, error };
};

/**
 * 台词数据Hook
 */
export const useDialogueData = () => {
  const [dialogues, setDialogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDialogues = async () => {
      try {
        setLoading(true);
        setError(null);
        const dialogueData = await dataService.getDialogues();
        setDialogues(dialogueData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading dialogues:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDialogues();
  }, []);

  return { dialogues, loading, error };
};

/**
 * 词频数据Hook
 */
export const useWordFrequency = (movieId) => {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWordData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataService.getMovieWordFrequency(movieId);
        setWordData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading word frequency data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      loadWordData();
    }
  }, [movieId]);

  // 获取词云数据
  const getWordCloudData = () => {
    if (!wordData || !wordData.words) return [];
    
    return wordData.words.map(word => ({
      name: word.word,
      value: word.frequency,
      textStyle: {
        color: getRandomColor(),
        fontSize: Math.max(12, Math.min(48, word.frequency * 2))
      }
    }));
  };

  // 获取词频图表数据
  const getWordChartData = () => {
    if (!wordData || !wordData.words) return [];
    
    return wordData.words
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20)
      .map(word => ({
        name: word.word,
        value: word.frequency,
        category: word.category
      }));
  };

  return {
    wordData,
    loading,
    error,
    getWordCloudData,
    getWordChartData
  };
};

/**
 * 统计数据Hook
 */
export const useStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await dataService.getStatistics();
        setStatistics(stats);
      } catch (err) {
        setError(err.message);
        console.error('Error loading statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  return { statistics, loading, error };
};

// 河流图数据Hook
export const useRiverChartData = () => {
  const [riverData, setRiverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateRiverData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const movies = await dataService.getMovieList();
        
        // 按年份分组电影数据
        const moviesByYear = movies.reduce((acc, movie) => {
          const year = movie.year;
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(movie);
          return acc;
        }, {});

        // 生成河流图数据结构
        const years = Object.keys(moviesByYear).sort((a, b) => parseInt(a) - parseInt(b));
        const riverData = years.map(year => ({
          year: parseInt(year),
          movies: moviesByYear[year],
          count: moviesByYear[year].length,
          avgRating: moviesByYear[year].reduce((sum, m) => sum + m.rating, 0) / moviesByYear[year].length,
          totalDuration: moviesByYear[year].reduce((sum, m) => sum + m.duration, 0)
        }));

        setRiverData(riverData);
      } catch (err) {
        setError(err.message);
        console.error('Error generating river chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    generateRiverData();
  }, []);

  return { riverData, loading, error };
};

// 统计图表数据Hook
export const useStatChartData = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const movies = await dataService.getMovieList();
        
        // 年代分布数据
        const decadeData = movies.reduce((acc, movie) => {
          const decade = Math.floor(movie.year / 10) * 10;
          const key = `${decade}s`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        // 评分分布数据
        const ratingData = movies.reduce((acc, movie) => {
          const rating = Math.floor(movie.rating);
          const key = `${rating}-${rating + 1}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        // 时长分布数据
        const durationData = movies.reduce((acc, movie) => {
          let category;
          if (movie.duration < 90) category = '短片(<90分钟)';
          else if (movie.duration < 120) category = '标准(90-120分钟)';
          else if (movie.duration < 150) category = '长片(120-150分钟)';
          else category = '超长(>150分钟)';
          
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        // 年份vs评分散点图数据
        const scatterData = movies.map(movie => ({
          x: movie.year,
          y: movie.rating,
          name: movie.title,
          duration: movie.duration
        }));

        // 热门电影Top10
        const topMovies = [...movies]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10)
          .map(movie => ({
            name: movie.title,
            rating: movie.rating,
            year: movie.year
          }));

        // 年份电影数量趋势
        const yearlyTrend = movies.reduce((acc, movie) => {
          acc[movie.year] = (acc[movie.year] || 0) + 1;
          return acc;
        }, {});

        const chartData = {
          decade: decadeData,
          rating: ratingData,
          duration: durationData,
          scatter: scatterData,
          topMovies,
          yearlyTrend
        };

        setChartData(chartData);
      } catch (err) {
        setError(err.message);
        console.error('Error generating chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    generateChartData();
  }, []);

  return { chartData, loading, error };
};

// 词云数据Hook
export const useWordCloudData = (movieId) => {
  const [wordCloudData, setWordCloudData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateWordCloudData = async () => {
      if (!movieId) return;

      try {
        setLoading(true);
        setError(null);
        
        const wordFrequency = await dataService.loadWordFrequency(movieId);
        
        // 转换为词云数据格式
        const wordCloudData = wordFrequency.map(item => ({
          text: item.word || item.词语 || item.text,
          value: item.frequency || item.频率 || item.count || 1,
          category: item.category || item.类别 || 'default'
        })).filter(item => item.text && item.value > 0);

        setWordCloudData(wordCloudData);
      } catch (err) {
        setError(err.message);
        console.error('Error generating word cloud data:', err);
      } finally {
        setLoading(false);
      }
    };

    generateWordCloudData();
  }, [movieId]);

  return { wordCloudData, loading, error };
};

// 雷达图数据Hook
export const useRadarChartData = (movieId) => {
  const [radarData, setRadarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateRadarData = async () => {
      if (!movieId) return;

      try {
        setLoading(true);
        setError(null);
        
        const movie = await dataService.getMovieList().then(movies => 
          movies.find(m => m.id === parseInt(movieId))
        );
        
        if (!movie) {
          throw new Error(`Movie with id ${movieId} not found`);
        }

        // 生成雷达图数据（示例维度）
        const radarData = {
          movie: movie.title,
          dimensions: [
            { name: '评分', value: movie.rating * 10, max: 100 },
            { name: '时长', value: Math.min(movie.duration / 2, 100), max: 100 },
            { name: '年代', value: Math.min((movie.year - 1960) / 0.6, 100), max: 100 },
            { name: '知名度', value: movie.rating * 10, max: 100 },
            { name: '经典度', value: movie.rating * 10, max: 100 },
            { name: '影响力', value: movie.rating * 10, max: 100 }
          ]
        };

        setRadarData(radarData);
      } catch (err) {
        setError(err.message);
        console.error('Error generating radar data:', err);
      } finally {
        setLoading(false);
      }
    };

    generateRadarData();
  }, [movieId]);

  return { radarData, loading, error };
};

// 图表配置Hook
export const useChartConfig = () => {
  const chartConfig = useMemo(() => ({
    // ECharts通用配置
    echarts: {
      theme: 'dark',
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'SourceHanSansCN-Regular, sans-serif',
        color: '#333'
      },
      animation: true,
      animationDuration: 1000
    },
    
    // D3.js通用配置
    d3: {
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
      transition: {
        duration: 750,
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    
    // 响应式断点
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  }), []);

  return chartConfig;
};

// 辅助函数：获取随机颜色
const getRandomColor = () => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
    '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#e17055',
    '#00b894', '#00cec9', '#0984e3', '#6c5ce7', '#a29bfe'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}; 