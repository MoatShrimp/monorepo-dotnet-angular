import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fake-web');
  private readonly http =  inject(HttpClient)

  btnClick() {
    this.http
      .get<{id:number, title:string}[]>('https://jsonplaceholder.typicode.com/todos/')
      .subscribe((todos) => {
        for (const i of (todos).filter((todo) => todo.id <= 10)) {
          this.http
            .get('https://jsonplaceholder.typicode.com/todos/' + i.id)
            .subscribe();
        }
      });
  }
}
