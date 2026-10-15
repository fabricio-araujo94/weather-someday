import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { WeatherData } from '../interfaces/weather';
import { ForecastData } from '../interfaces/forecast';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = '/api/weather';
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setInCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Obtém a localização atual do usuário via Geolocation API do navegador
   */
  getCurrentPosition(): Observable<GeolocationPosition> {
    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocalização não é suportada pelo seu navegador.'));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000
          });
        }
      })
    ).pipe(
      catchError((error) => {
        let errorMsg = 'Não foi possível obter sua localização.';
        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Permissão de geolocalização negada pelo usuário.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Informações de localização indisponíveis.';
              break;
            case error.TIMEOUT:
              errorMsg = 'A requisição para obter a localização expirou.';
              break;
          }
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Busca o clima atual por coordenadas (Latitude e Longitude)
   */
  getCurrentWeatherByCoords(lat: number, lon: number): Observable<WeatherData> {
    const cacheKey = `weather_coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = this.getFromCache<WeatherData>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('type', 'weather');

    return this.http.get<WeatherData>(this.apiUrl, { params }).pipe(
      tap((data) => this.setInCache(cacheKey, data)),
      catchError(this.handleError)
    );
  }

  /**
   * Busca a previsão do tempo (5 dias / 3 em 3 horas) por coordenadas
   */
  getForecastByCoords(lat: number, lon: number): Observable<ForecastData> {
    const cacheKey = `forecast_coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = this.getFromCache<ForecastData>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('type', 'forecast');

    return this.http.get<ForecastData>(this.apiUrl, { params }).pipe(
      tap((data) => this.setInCache(cacheKey, data)),
      catchError(this.handleError)
    );
  }

  /**
   * Busca o clima atual por nome da cidade
   */
  getCurrentWeatherByCity(city: string): Observable<WeatherData> {
    const normalized = city.trim().toLowerCase();
    const cacheKey = `weather_city_${normalized}`;
    const cached = this.getFromCache<WeatherData>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('city', city)
      .set('type', 'weather');

    return this.http.get<WeatherData>(this.apiUrl, { params }).pipe(
      tap((data) => this.setInCache(cacheKey, data)),
      catchError(this.handleError)
    );
  }

  /**
   * Busca a previsão do tempo por nome da cidade
   */
  getForecastByCity(city: string): Observable<ForecastData> {
    const normalized = city.trim().toLowerCase();
    const cacheKey = `forecast_city_${normalized}`;
    const cached = this.getFromCache<ForecastData>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('city', city)
      .set('type', 'forecast');

    return this.http.get<ForecastData>(this.apiUrl, { params }).pipe(
      tap((data) => this.setInCache(cacheKey, data)),
      catchError(this.handleError)
    );
  }

  /**
   * Tratamento centralizado de erros de requisição HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro retornado pelo BFF / Servidor
      const errBody = error.error;
      if (errBody) {
        if (typeof errBody === 'string') {
          errorMessage = errBody;
        } else if (typeof errBody === 'object') {
          if (typeof errBody.message === 'string') {
            errorMessage = errBody.message;
          } else if (typeof errBody.error === 'string') {
            errorMessage = errBody.error;
          } else if (typeof errBody.message === 'object') {
            errorMessage = JSON.stringify(errBody.message);
          } else if (typeof errBody.error === 'object') {
            errorMessage = JSON.stringify(errBody.error);
          }
        }
      }

      if (errorMessage === 'Ocorreu um erro desconhecido.') {
        switch (error.status) {
          case 400:
            errorMessage = 'Parâmetros de busca inválidos.';
            break;
          case 401:
            errorMessage = 'Erro de autenticação com a API de clima (Chave ausente ou inválida).';
            break;
          case 404:
            errorMessage = 'Cidade ou localização não encontrada.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Serviço de clima indisponível no momento.';
            break;
          default:
            errorMessage = `Código do erro: ${error.status}, Mensagem: ${error.message}`;
        }
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
