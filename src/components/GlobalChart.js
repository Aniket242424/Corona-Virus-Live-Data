import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  ToggleButton, 
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { 
  CalendarToday,
  DateRange,
  TrendingUp,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';

const GlobalChart = ({ data, selectedCountry }) => {
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [dataAvailability, setDataAvailability] = useState({ lastUpdate: null, dataPoints: 0 });
  
  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days', icon: '📅' },
    { value: '30', label: 'Last 30 days', icon: '📊' },
    { value: '90', label: 'Last 90 days', icon: '📈' },
    { value: '180', label: 'Last 6 months', icon: '🗓️' },
    { value: '365', label: 'Last year', icon: '📆' },
    { value: 'all', label: 'All time', icon: '🌍' }
  ];

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        const daysParam = dateRange === 'all' ? 'all' : dateRange;
        const url = selectedCountry === 'Global' 
          ? `https://disease.sh/v3/covid-19/historical/all?lastdays=${daysParam}`
          : `https://disease.sh/v3/covid-19/historical/${selectedCountry}?lastdays=${daysParam}`;
        
        const response = await axios.get(url);
        const historicalData = selectedCountry === 'Global' 
          ? response.data 
          : response.data.timeline;

        // Check if we have valid data
        if (!historicalData || !historicalData.cases || Object.keys(historicalData.cases).length === 0) {
          console.warn('No historical data available for', selectedCountry, 'in date range', dateRange);
          setChartData([]);
          return;
        }

        const formattedData = Object.keys(historicalData.cases).map((date, index, array) => {
          const dateObj = new Date(date);
          const today = new Date();
          
          // Create a more readable date format
          const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const monthDay = dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          });
          
          // Show day of week for every 5th point to avoid clutter
          const showDayOfWeek = index % 5 === 0 || index === array.length - 1;
          
          const cases = historicalData.cases[date] || 0;
          const deaths = historicalData.deaths[date] || 0;
          const recovered = historicalData.recovered[date] || 0;
          
          return {
            date: showDayOfWeek ? `${dayOfWeek}\n${monthDay}` : monthDay,
            dateShort: monthDay,
            fullDate: dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }),
            cases: cases,
            deaths: deaths,
            recovered: recovered,
            // Add calculated fields for better visualization
            activeCases: cases - recovered - deaths
          };
        });

        setChartData(formattedData);
        
        // Update data availability info
        const lastDate = formattedData[formattedData.length - 1]?.fullDate;
        setDataAvailability({
          lastUpdate: lastDate,
          dataPoints: formattedData.length
        });
        
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setChartData([]);
        setDataAvailability({ lastUpdate: null, dataPoints: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [selectedCountry, dateRange]);

  const pieData = data ? [
    { name: 'Recovered', value: data.recovered || 0, color: '#4caf50' },
    { name: 'Active', value: data.cases - (data.recovered || 0) - data.deaths, color: '#ff9800' },
    { name: 'Deaths', value: data.deaths, color: '#f44336' }
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the full date from the chart data
      const dataPoint = chartData.find(item => item.date === label || item.dateShort === label);
      const displayDate = dataPoint?.fullDate || label;
      
      return (
        <Box
          sx={{
            bgcolor: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(0, 188, 212, 0.4)',
            borderRadius: 3,
            p: 2.5,
            backdropFilter: 'blur(15px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minWidth: 200
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#00bcd4', 
              fontWeight: 600, 
              mb: 1.5,
              textAlign: 'center'
            }}
          >
            📅 {displayDate}
          </Typography>
          {payload.map((entry, index) => (
            <Box 
              key={index} 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              mb={0.5}
            >
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: entry.color,
                    mr: 1,
                    boxShadow: `0 2px 8px ${entry.color}40`
                  }}
                />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {entry.name}:
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: entry.color, 
                  fontWeight: 600,
                  ml: 2
                }}
              >
                {entry.value?.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 188, 212, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 188, 212, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #00bcd4, #ff4081, #4caf50, #ff9800)',
            backgroundSize: '200% 100%',
            animation: 'gradientShift 3s ease-in-out infinite',
          }
        }}
      >
        <CardContent>
          {/* Date Range Filter */}
          <Box mb={3}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Box display="flex" alignItems="center" gap={1}>
                <DateRange sx={{ color: '#00bcd4', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                  Time Period:
                </Typography>
              </Box>
              
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Select Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Select Range"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 188, 212, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 188, 212, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00bcd4',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                >
                  {dateRangeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {chartData.length > 0 && (
                <Chip
                  icon={<CalendarToday />}
                  label={`${chartData.length} data points`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 188, 212, 0.2)',
                    color: '#00bcd4',
                    border: '1px solid rgba(0, 188, 212, 0.3)',
                    fontWeight: 500
                  }}
                />
              )}
              
              {dataAvailability.lastUpdate && (
                <Chip
                  icon={<DateRange />}
                  label={`Last update: ${dataAvailability.lastUpdate}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                    color: '#ff9800',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    fontWeight: 500
                  }}
                />
              )}
              
              <Chip
                label="Data: disease.sh API"
                size="small"
                sx={{
                  bgcolor: 'rgba(156, 156, 156, 0.2)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(156, 156, 156, 0.3)',
                  fontWeight: 500,
                  fontSize: '0.7rem'
                }}
              />
            </Stack>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {selectedCountry === 'Global' ? 'Global' : selectedCountry} Trends
              </Typography>
              {chartData.length > 0 && (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  📊 {dateRangeOptions.find(opt => opt.value === dateRange)?.label}: {chartData[0]?.fullDate} - {chartData[chartData.length - 1]?.fullDate}
                </Typography>
              )}
            </Box>
            
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newType) => newType && setChartType(newType)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(0, 188, 212, 0.3)',
                  px: 2,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(0, 188, 212, 0.2)',
                    color: '#00bcd4',
                    borderColor: '#00bcd4'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0, 188, 212, 0.1)',
                    borderColor: 'rgba(0, 188, 212, 0.5)'
                  }
                }
              }}
            >
              <ToggleButton value="line">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TrendingUp sx={{ fontSize: 16 }} />
                  <span>Line</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="bar">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <BarChartIcon sx={{ fontSize: 16 }} />
                  <span>Bar</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="pie">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <PieChartIcon sx={{ fontSize: 16 }} />
                  <span>Pie</span>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Box textAlign="center">
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                  Loading chart data...
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Fetching data for {selectedCountry === 'Global' ? 'Global' : selectedCountry}
                </Typography>
              </Box>
            </Box>
          ) : chartData.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <Box textAlign="center" maxWidth={400}>
                <Typography variant="h6" sx={{ color: 'rgba(255, 152, 0, 0.8)', mb: 2 }}>
                  ⚠️ No Data Available
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  Historical data for {selectedCountry === 'Global' ? 'Global' : selectedCountry} 
                  is not available for the selected time period ({dateRangeOptions.find(opt => opt.value === dateRange)?.label.toLowerCase()}).
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
                  This could be because:
                </Typography>
                <Box textAlign="left" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  <Typography variant="body2" component="div">• The data source may not have recent updates</Typography>
                  <Typography variant="body2" component="div">• COVID-19 reporting may have changed or stopped</Typography>
                  <Typography variant="body2" component="div">• Try selecting a different time period</Typography>
                </Box>
                <Box mt={3}>
                  <Chip
                    label="Try: Last 90 days or All time"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 188, 212, 0.2)',
                      color: '#00bcd4',
                      border: '1px solid rgba(0, 188, 212, 0.3)'
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart 
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255, 255, 255, 0.15)" 
                      strokeOpacity={0.3}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255, 255, 255, 0.8)"
                      fontSize={11}
                      tick={{ 
                        fill: 'rgba(255, 255, 255, 0.8)',
                        fontSize: 10,
                        fontWeight: 500
                      }}
                      interval={Math.floor(chartData.length / 8)}
                      tickLine={{ stroke: 'rgba(0, 188, 212, 0.4)', strokeWidth: 1 }}
                      axisLine={{ stroke: 'rgba(0, 188, 212, 0.4)', strokeWidth: 1 }}
                      tickMargin={8}
                    />
                    <YAxis 
                      stroke="rgba(255, 255, 255, 0.8)"
                      fontSize={11}
                      tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return value.toLocaleString();
                      }}
                      tickLine={{ stroke: 'rgba(0, 188, 212, 0.4)', strokeWidth: 1 }}
                      axisLine={{ stroke: 'rgba(0, 188, 212, 0.4)', strokeWidth: 1 }}
                      domain={['dataMin - 5%', 'dataMax + 10%']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="cases" 
                      stroke="url(#casesGradient)" 
                      strokeWidth={5}
                      dot={{ fill: '#2196f3', strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 10, stroke: '#2196f3', strokeWidth: 4, fill: '#fff' }}
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="recovered" 
                      stroke="url(#recoveredGradient)" 
                      strokeWidth={5}
                      dot={{ fill: '#4caf50', strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 10, stroke: '#4caf50', strokeWidth: 4, fill: '#fff' }}
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="deaths" 
                      stroke="url(#deathsGradient)" 
                      strokeWidth={5}
                      dot={{ fill: '#f44336', strokeWidth: 3, r: 6 }}
                      activeDot={{ r: 10, stroke: '#f44336', strokeWidth: 4, fill: '#fff' }}
                      connectNulls={false}
                    />
                    <defs>
                      <linearGradient id="casesGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00bcd4" stopOpacity={1} />
                        <stop offset="50%" stopColor="#2196f3" stopOpacity={1} />
                        <stop offset="100%" stopColor="#1976d2" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="recoveredGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4caf50" stopOpacity={1} />
                        <stop offset="50%" stopColor="#8bc34a" stopOpacity={1} />
                        <stop offset="100%" stopColor="#689f38" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="deathsGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f44336" stopOpacity={1} />
                        <stop offset="50%" stopColor="#ff5722" stopOpacity={1} />
                        <stop offset="100%" stopColor="#d32f2f" stopOpacity={1} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}
                      iconType="line"
                      formatter={(value) => (
                        <span style={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {value}
                        </span>
                      )}
                    />
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart 
                    data={chartData.slice(-14)} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255, 255, 255, 0.8)"
                      fontSize={10}
                      tick={{ 
                        fill: 'rgba(255, 255, 255, 0.8)',
                        fontSize: 9,
                        fontWeight: 500
                      }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={90}
                      tickLine={{ stroke: 'rgba(0, 188, 212, 0.4)', strokeWidth: 1 }}
                      axisLine={{ stroke: 'rgba(0, 188, 212, 0.4)', strokeWidth: 1 }}
                      tickMargin={12}
                    />
                    <YAxis 
                      stroke="rgba(255, 255, 255, 0.8)"
                      fontSize={11}
                      tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return value.toLocaleString();
                      }}
                      tickLine={{ stroke: 'rgba(0, 188, 212, 0.3)' }}
                      axisLine={{ stroke: 'rgba(0, 188, 212, 0.3)' }}
                      domain={[0, 'dataMax + 10%']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
                      <linearGradient id="barCasesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00bcd4" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2196f3" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="barRecoveredGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8bc34a" stopOpacity={1} />
                        <stop offset="100%" stopColor="#4caf50" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="barDeathsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff5722" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f44336" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Bar 
                      dataKey="cases" 
                      fill="url(#barCasesGradient)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={60}
                    />
                    <Bar 
                      dataKey="recovered" 
                      fill="url(#barRecoveredGradient)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={60}
                    />
                    <Bar 
                      dataKey="deaths" 
                      fill="url(#barDeathsGradient)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={60}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}
                      iconType="circle"
                      formatter={(value) => (
                        <span style={{ 
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {value}
                        </span>
                      )}
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={140}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value?.toLocaleString(), name]}
                      contentStyle={{
                        backgroundColor: 'rgba(26, 26, 26, 0.9)',
                        border: '1px solid rgba(0, 188, 212, 0.3)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GlobalChart;