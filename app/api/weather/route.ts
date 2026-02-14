import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city');

  // Using OpenWeatherMap API (free tier)
  const API_KEY = process.env.OPENWEATHER_API_KEY || ''; // You'll need to add this to .env.local

  try {
    let url = '';

    if (lat && lon) {
      // Fetch by coordinates
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else if (city) {
      // Fetch by city name
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    } else {
      // Default to Nairobi if no location provided
      url = `https://api.openweathermap.org/data/2.5/weather?q=Nairobi,KE&appid=${API_KEY}&units=metric`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      // Return mock data if API fails or no API key
      return NextResponse.json({
        main: {
          temp: 24,
          feels_like: 26,
          humidity: 65,
          pressure: 1013,
        },
        weather: [
          {
            main: 'Clouds',
            description: 'Light clouds',
            icon: '02d',
          },
        ],
        wind: {
          speed: 12,
        },
        clouds: {
          all: 40,
        },
        sys: {
          sunrise: Date.now() / 1000 - 21600,
          sunset: Date.now() / 1000 + 21600,
        },
        name: city || 'Nairobi',
        coord: {
          lat: lat ? parseFloat(lat) : -1.286389,
          lon: lon ? parseFloat(lon) : 36.817223,
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather API error:', error);

    // Return mock data on error
    return NextResponse.json({
      main: {
        temp: 24,
        feels_like: 26,
        humidity: 65,
        pressure: 1013,
      },
      weather: [
        {
          main: 'Clouds',
          description: 'Light clouds',
          icon: '02d',
        },
      ],
      wind: {
        speed: 12,
      },
      clouds: {
        all: 40,
      },
      sys: {
        sunrise: Date.now() / 1000 - 21600,
        sunset: Date.now() / 1000 + 21600,
      },
      name: city || (lat && lon ? 'My Farm (Demo)' : 'Nairobi'),
      coord: {
        lat: lat ? parseFloat(lat) : -1.286389,
        lon: lon ? parseFloat(lon) : 36.817223,
      },
    });
  }
}
