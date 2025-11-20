import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { environment } from '../../../environments/environment'; // Asumiendo que tienes esto

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Uso moderno: inject() en lugar de constructor tradicional
  private http = inject(HttpClient);
  private apiUrl = 'https://api.tudominio.com'; // O environment.apiUrl

  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  /**
   * GET Request
   * @param path Endpoint path
   * @param params Query parameters object
   */
  get<T>(path: string, params: any = {}): Observable<T> {
    // Convierte objeto JS a HttpParams de Angular automáticamente
    const httpParams = new HttpParams({ fromObject: params });

    return this.http.get<T>(`${this.apiUrl}/${path}`, {
      headers: this.defaultHeaders,
      params: httpParams,
      withCredentials: true // Para cookies/sesiones
    }).pipe(catchError(this.handleError));
  }

  /**
   * POST Request
   */
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${path}`, body, {
      headers: this.defaultHeaders,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  /**
   * PUT Request
   */
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${path}`, body, {
      headers: this.defaultHeaders,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  /**
   * DELETE Request
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${path}`, {
      headers: this.defaultHeaders,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Manejo de errores centralizado
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      // Aquí podrías manejar 401 para redirigir al login automáticamente
      if (error.status === 401) {
          console.warn('Sesión expirada o no autorizada');
          // router.navigate(['/login']);
      }
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
