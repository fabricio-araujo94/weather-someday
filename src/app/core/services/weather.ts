import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WeatherData } from '../interfaces/weather';
import { ForecastData } from '../interfaces/forecast';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiKey = environment.weatherApiKey;
  private apiUrl = environment.apiUrl;

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
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
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
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.apiKey)
      .set('units', 'metric')
      .set('lang', 'pt_br');

    return this.http.get<WeatherData>(`${this.apiUrl}/weather`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca a previsão do tempo (5 dias / 3 em 3 horas) por coordenadas
   */
  getForecastByCoords(lat: number, lon: number): Observable<ForecastData> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('appid', this.apiKey)
      .set('units', 'metric')
      .set('lang', 'pt_br');

    return this.http.get<ForecastData>(`${this.apiUrl}/forecast`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca o clima atual por nome da cidade
   */
  getCurrentWeatherByCity(city: string): Observable<WeatherData> {
    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.apiKey)
      .set('units', 'metric')
      .set('lang', 'pt_br');

    return this.http.get<WeatherData>(`${this.apiUrl}/weather`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Busca a previsão do tempo por nome da cidade
   */
  getForecastByCity(city: string): Observable<ForecastData> {
    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.apiKey)
      .set('units', 'metric')
      .set('lang', 'pt_br');

    return this.http.get<ForecastData>(`${this.apiUrl}/forecast`, { params }).pipe(
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
      // Erro retornado pela API do OpenWeatherMap
      switch (error.status) {
        case 401:
          errorMessage = 'Chave da API (API Key) inválida ou não informada.';
          break;
        case 404:
          errorMessage = 'Cidade ou localização não encontrada.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Servidor do OpenWeatherMap indisponível no momento.';
          break;
        default:
          errorMessage = `Código do erro: ${error.status}, Mensagem: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
