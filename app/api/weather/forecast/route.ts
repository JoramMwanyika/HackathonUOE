import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city');

  const API_KEY = process.env.OPENWEATHER_API_KEY || '';
  
  try {
    let url = '';
    
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=8`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&cnt=8`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=Nairobi,KE&appid=${API_KEY}&units=metric&cnt=8`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      // Return mock forecast data
      return NextResponse.json({
        list: [
          {
            dt: Date.now() / 1000 + 10800,
            main: { temp: 25, humidity: 60 },
            weather: [{ main: 'Clear', icon: '01d' }],
            pop: 0.1,
          },
          {
            dt: Date.now() / 1000 + 21600,
            main: { temp: 23, humidity: 65 },
            weather: [{ main: 'Clouds', icon: '02d' }],
            pop: 0.2,
          },
          {
            dt: Date.now() / 1000 + 32400,
            main: { temp: 26, humidity: 55 },
            weather: [{ main: 'Clear', icon: '01d' }],
            pop: 0.0,
          },
        ],
        city: {
          name: city || 'Nairobi',
          coord: {
            lat: lat ? parseFloat(lat) : -1.286389,
            lon: lon ? parseFloat(lon) : 36.817223,
          },
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Forecast API error:', error);
    
    return NextResponse.json({
      list: [
        {
          dt: Date.now() / 1000 + 10800,
          main: { temp: 25, humidity: 60 },
          weather: [{ main: 'Clear', icon: '01d' }],
          pop: 0.1,
        },
        {
          dt: Date.now() / 1000 + 21600,
          main: { temp: 23, humidity: 65 },
          weather: [{ main: 'Clouds', icon: '02d' }],
          pop: 0.2,
        },
        {
          dt: Date.now() / 1000 + 32400,
          main: { temp: 26, humidity: 55 },
          weather: [{ main: 'Clear', icon: '01d' }],
          pop: 0.0,
        },
      ],
      city: {
        name: city || 'Nairobi',
        coord: {
          lat: lat ? parseFloat(lat) : -1.286389,
          lon: lon ? parseFloat(lon) : 36.817223,
        },
      },
    });
  }
}
