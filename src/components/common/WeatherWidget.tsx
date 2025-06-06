
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainChance: number;
  condition: string;
  icon: string;
}

const mockWeatherData: WeatherData = {
  location: "Farmer's Location",
  temperature: 28,
  humidity: 65,
  rainChance: 30,
  condition: "Partly Cloudy",
  icon: "☁️",
};

const weatherIcons: Record<string, string> = {
  "Clear": "☀️",
  "Sunny": "☀️",
  "Partly Cloudy": "⛅",
  "Cloudy": "☁️",
  "Overcast": "☁️",
  "Rain": "🌧️",
  "Thunderstorm": "⛈️",
  "Snow": "❄️",
  "Fog": "🌫️",
  "Mist": "🌫️",
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>(mockWeatherData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchWeather = () => {
      setIsLoading(true);
      // In a real app, this would fetch from a weather API
      setTimeout(() => {
        // Randomize weather data slightly for demo purposes
        const tempVariation = Math.random() * 4 - 2; // -2 to +2 degrees
        const humidityVariation = Math.random() * 10 - 5; // -5 to +5 percent
        const rainChanceVariation = Math.random() * 20 - 10; // -10 to +10 percent
        
        const conditions = ["Clear", "Partly Cloudy", "Cloudy", "Rain"];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        setWeather({
          ...mockWeatherData,
          temperature: Math.round(mockWeatherData.temperature + tempVariation),
          humidity: Math.round(mockWeatherData.humidity + humidityVariation),
          rainChance: Math.round(mockWeatherData.rainChance + rainChanceVariation),
          condition: randomCondition,
          icon: weatherIcons[randomCondition] || "❓",
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="overflow-hidden border-krishi-200">
      <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <span>Today's Weather</span>
          <span className="text-2xl">{weather.icon}</span>
        </CardTitle>
        <Text className="text-white/80">{weather.location}</Text>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-krishi-500 border-t-transparent rounded-full animate-spin"></div>
            <Text className="mt-2" variant="muted">Loading weather data...</Text>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Text size="sm" variant="muted">Temperature</Text>
              <Text size="xl" className="font-semibold">{weather.temperature}°C</Text>
            </div>
            <div className="space-y-1">
              <Text size="sm" variant="muted">Humidity</Text>
              <Text size="xl" className="font-semibold">{weather.humidity}%</Text>
            </div>
            <div className="space-y-1">
              <Text size="sm" variant="muted">Rain Chance</Text>
              <Text size="xl" className="font-semibold">{weather.rainChance}%</Text>
            </div>
            <div className="space-y-1">
              <Text size="sm" variant="muted">Condition</Text>
              <Text size="xl" className="font-semibold">{weather.condition}</Text>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
