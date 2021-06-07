import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { NzMessageService } from "ng-zorro-antd/message";

/*设置请求的基地址，方便替换*/
const baseurl = "http://localhost:8085";

@Injectable()
export class BaseInterceptor implements HttpInterceptor {
  constructor(private message: NzMessageService) {}

  intercept(req, next: HttpHandler) {
    let newReq = req.clone({
      url: req.hadBaseurl ? `${req.url}` : `${baseurl}${req.url}`,
    });
    /*此处设置额外的头部，token常用于登陆令牌*/
    let token: string = localStorage.getItem("token");
    if (token) {
      /*token数据来源自己设置，我常用localStorage存取相关数据*/
      newReq.headers = newReq.headers.set("Bearer", token);
    }

    // send cloned request with header to the next handler.
    return next.handle(newReq).pipe(
      /*失败时重试2次，可自由设置*/
      retry(2),
      /*捕获响应错误，可根据需要自行改写，我偷懒了，直接用的官方的*/
      //catchError(this.handleError) // this指向调用者
      catchError((err) => this.handleError(err)) // this指向class
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
          `body was: ${error.error.message}`
      );
      this.message.error(error.error.message);
    }
    // return an observable with a user-facing error message
    return throwError("Something bad happened; please try again later.");
  }
}
