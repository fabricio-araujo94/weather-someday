import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { WeatherService } from './weather';
import { WeatherData } from '../interfaces/weather';
import { ForecastData } from '../interfaces/forecast';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  const mockWeatherData: WeatherData = {
    coord: { lon: -46.6333, lat: -23.5505 },
    weather: [{ id: 800, main: 'Clear', description: 'céu limpo', icon: '01d' }],
    base: 'stations',
    main: {
      temp: 22,
      feels_like: 22,
      temp_min: 20,
      temp_max: 24,
      pressure: 1015,
      humidity: 60
    },
    visibility: 10000,
    wind: { speed: 4.5, deg: 180 },
    clouds: { all: 0 },
    dt: 1700000000,
    sys: { type: 1, id: 1, country: 'BR', sunrise: 1700000000, sunset: 1700045000 },
    timezone: -10800,
    id: 3448439,
    name: 'São Paulo',
    cod: 200
  };

  const mockForecastData: ForecastData = {
    cod: '200',
    message: 0,
    cnt: 40,
    list: [],
    city: {
      id: 3448439,
      name: 'São Paulo',
      coord: { lat: -23.5505, lon: -46.6333 },
      country: 'BR',
      population: 10000000,
      timezone: -10800,
      sunrise: 1700000000,
      sunset: 1700045000
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentWeatherByCoords', () => {
    it('should query /api/weather with lat, lon and type=weather', () => {
      service.getCurrentWeatherByCoords(-23.55, -46.63).subscribe((data) => {
        expect(data).toEqual(mockWeatherData);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/weather' &&
          request.params.get('lat') === '-23.55' &&
          request.params.get('lon') === '-46.63' &&
          request.params.get('type') === 'weather'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockWeatherData);
    });
  });

  describe('getForecastByCoords', () => {
    it('should query /api/weather with lat, lon and type=forecast', () => {
      service.getForecastByCoords(-23.55, -46.63).subscribe((data) => {
        expect(data).toEqual(mockForecastData);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/weather' &&
          request.params.get('lat') === '-23.55' &&
          request.params.get('lon') === '-46.63' &&
          request.params.get('type') === 'forecast'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockForecastData);
    });
  });

  describe('getCurrentWeatherByCity', () => {
    it('should query /api/weather with city and type=weather', () => {
      service.getCurrentWeatherByCity('Rio de Janeiro').subscribe((data) => {
        expect(data).toEqual(mockWeatherData);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/weather' &&
          request.params.get('city') === 'Rio de Janeiro' &&
          request.params.get('type') === 'weather'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockWeatherData);
    });
  });

  describe('getForecastByCity', () => {
    it('should query /api/weather with city and type=forecast', () => {
      service.getForecastByCity('Rio de Janeiro').subscribe((data) => {
        expect(data).toEqual(mockForecastData);
      });

      const req = httpMock.expectOne((request) => {
        return (
          request.url === '/api/weather' &&
          request.params.get('city') === 'Rio de Janeiro' &&
          request.params.get('type') === 'forecast'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockForecastData);
    });
  });

  describe('Error handling (handleError)', () => {
    it('should return error message when API responds with 400', () => {
      let errorResult: any = null;
      service.getCurrentWeatherByCity('Invalid').subscribe({
        next: () => {},
        error: (err: unknown) => {
          errorResult = err;
        }
      });

      const req = httpMock.expectOne((r) => r.url === '/api/weather');
      req.flush(null, { status: 400, statusText: 'Bad Request' });
      expect(errorResult).not.toBeNull();
      expect(errorResult?.message).toBe('Parâmetros de busca inválidos.');
    });

    it('should return error message when API responds with 401', () => {
      let errorResult: any = null;
      service.getCurrentWeatherByCity('São Paulo').subscribe({
        next: () => {},
        error: (err: unknown) => {
          errorResult = err;
        }
      });

      const req = httpMock.expectOne((r) => r.url === '/api/weather');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
      expect(errorResult).not.toBeNull();
      expect(errorResult?.message).toBe('Erro de autenticação com a API de clima (Chave ausente ou inválida).');
    });

    it('should return error message when API responds with 404', () => {
      let errorResult: any = null;
      service.getCurrentWeatherByCity('CidadeInexistente').subscribe({
        next: () => {},
        error: (err: unknown) => {
          errorResult = err;
        }
      });

      const req = httpMock.expectOne((r) => r.url === '/api/weather');
      req.flush(null, { status: 404, statusText: 'Not Found' });
      expect(errorResult).not.toBeNull();
      expect(errorResult?.message).toBe('Cidade ou localização não encontrada.');
    });

    it('should return server unavailable message when API responds with 500', () => {
      let errorResult: any = null;
      service.getCurrentWeatherByCity('São Paulo').subscribe({
        next: () => {},
        error: (err: unknown) => {
          errorResult = err;
        }
      });

      const req = httpMock.expectOne((r) => r.url === '/api/weather');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(errorResult).not.toBeNull();
      expect(errorResult?.message).toBe('Serviço de clima indisponível no momento.');
    });

    it('should parse message string from response body if provided', () => {
      let errorResult: any = null;
      service.getCurrentWeatherByCity('São Paulo').subscribe({
        next: () => {},
        error: (err: unknown) => {
          errorResult = err;
        }
      });

      const req = httpMock.expectOne((r) => r.url === '/api/weather');
      req.flush({ message: 'Custom backend error' }, { status: 422, statusText: 'Unprocessable Entity' });
      expect(errorResult).not.toBeNull();
      expect(errorResult?.message).toBe('Custom backend error');
    });
  });

  describe('getCurrentPosition', () => {
    beforeEach(() => {
      if (!('geolocation' in navigator)) {
        (navigator as any).geolocation = {
          getCurrentPosition: vi.fn()
        };
      }
    });

    it('should return coordinates when geolocation succeeds', async () => {
      const mockPosition = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      } as GeolocationPosition;

      vi.spyOn(navigator.geolocation, 'getCurrentPosition').mockImplementation(
        (successCallback: PositionCallback) => {
          successCallback(mockPosition);
        }
      );

      const position = await firstValueFrom(service.getCurrentPosition());
      expect(position.coords.latitude).toBe(-23.5505);
      expect(position.coords.longitude).toBe(-46.6333);
    });

    it('should handle geolocation error properly', async () => {
      const mockError = {
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'User denied Geolocation'
      };

      if (typeof GeolocationPositionError !== 'undefined') {
        Object.setPrototypeOf(mockError, GeolocationPositionError.prototype);
      } else {
        (globalThis as any).GeolocationPositionError = class {
          static PERMISSION_DENIED = 1;
          static POSITION_UNAVAILABLE = 2;
          static TIMEOUT = 3;
        };
        Object.setPrototypeOf(mockError, (globalThis as any).GeolocationPositionError.prototype);
      }

      vi.spyOn(navigator.geolocation, 'getCurrentPosition').mockImplementation(
        (_success: PositionCallback, errorCallback?: PositionErrorCallback | null) => {
          if (errorCallback) errorCallback(mockError as any);
        }
      );

      await expect(firstValueFrom(service.getCurrentPosition())).rejects.toThrow(
        'Permissão de geolocalização negada pelo usuário.'
      );
    });
  });
});
