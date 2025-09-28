import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, CircularProgress } from '@mui/material';
import { 
  LocalHospital, 
  Healing, 
  Warning, 
  PersonOff,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}25, ${color}15, ${color}05)`,
        border: `1px solid ${color}50`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 8px 32px ${color}20, 0 0 0 1px ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${color}30, 0 0 0 1px ${color}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              <CountUp
                start={0}
                end={value}
                duration={2.5}
                separator=","
                decimals={0}
              />
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${color}30, ${color}20)`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${color}40`,
              boxShadow: `0 4px 16px ${color}30`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: `0 6px 20px ${color}40`,
              }
            }}
          >
            <Icon sx={{ fontSize: 32, color: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
          </Box>
        </Box>
        
        {trend && (
          <Box mt={2} display="flex" alignItems="center">
            {trend > 0 ? (
              <TrendingUp sx={{ color: '#ff4081', mr: 0.5, fontSize: 16 }} />
            ) : (
              <TrendingDown sx={{ color: '#4caf50', mr: 0.5, fontSize: 16 }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend > 0 ? '#ff4081' : '#4caf50',
                fontWeight: 600
              }}
            >
              {Math.abs(trend)}% from yesterday
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = ({ data, selectedCountry, countries, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!data) return null;

  const activeCases = data.cases - (data.recovered || 0) - data.deaths;
  const recoveryRate = data.recovered && data.cases ? ((data.recovered / data.cases) * 100).toFixed(1) : '0.0';
  const deathRate = ((data.deaths / data.cases) * 100).toFixed(1);

  const stats = [
    {
      title: 'Total Cases',
      value: data.cases,
      icon: LocalHospital,
      color: '#2196f3',
      subtitle: `+${data.todayCases?.toLocaleString() || 0} today`
    },
    {
      title: 'Recovered',
      value: data.recovered || 0,
      icon: Healing,
      color: '#4caf50',
      subtitle: `${recoveryRate}% recovery rate`
    },
    {
      title: 'Active Cases',
      value: activeCases,
      icon: Warning,
      color: '#ff9800',
      subtitle: `${((activeCases / data.cases) * 100).toFixed(1)}% of total`
    },
    {
      title: 'Deaths',
      value: data.deaths,
      icon: PersonOff,
      color: '#f44336',
      subtitle: `${deathRate}% fatality rate`
    }
  ];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            mb: 3,
            background: 'linear-gradient(45deg, #00bcd4, #ff4081)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {selectedCountry === 'Global' ? 'Global Statistics' : `${selectedCountry} Statistics`}
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
        <Chip
          label={`Recovery Rate: ${recoveryRate}%`}
          color="success"
          variant="outlined"
          sx={{ 
            bgcolor: 'rgba(76, 175, 80, 0.15)',
            border: '1px solid rgba(76, 175, 80, 0.4)',
            color: '#4caf50',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(76, 175, 80, 0.25)',
              transform: 'scale(1.05)',
            }
          }}
        />
        <Chip
          label={`Fatality Rate: ${deathRate}%`}
          color="error"
          variant="outlined"
          sx={{ 
            bgcolor: 'rgba(244, 67, 54, 0.15)',
            border: '1px solid rgba(244, 67, 54, 0.4)',
            color: '#f44336',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.25)',
              transform: 'scale(1.05)',
            }
          }}
        />
        <Chip
          label={`Active Rate: ${((activeCases / data.cases) * 100).toFixed(1)}%`}
          color="warning"
          variant="outlined"
          sx={{ 
            bgcolor: 'rgba(255, 152, 0, 0.15)',
            border: '1px solid rgba(255, 152, 0, 0.4)',
            color: '#ff9800',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(255, 152, 0, 0.25)',
              transform: 'scale(1.05)',
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;