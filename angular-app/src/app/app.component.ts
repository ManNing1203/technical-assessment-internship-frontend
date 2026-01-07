import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Task 5:Add an Angular application';
  
  //form
  contactForm: FormGroup;
  submitted = false;
  formSubmitted = false;
  
  //http data
  users: User[] = [];
  posts: Post[] = [];
  selectedUser: User | null = null;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    //validators
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,12}$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      agreement: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadPosts();
  }

  //form validation getters
  get f() { return this.contactForm.controls; }

  //http calls - Load Users from JSONPlaceholder API
  loadUsers(): void {
    this.loading = true;
    this.http.get<User[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load users';
          this.loading = false;
          console.error('Error loading users:', error);
        }
      });
  }

  //http calls - Load Posts
  loadPosts(): void {
    this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=5')
      .subscribe({
        next: (data) => {
          this.posts = data;
        },
        error: (error) => {
          console.error('Error loading posts:', error);
        }
      });
  }

  //business logic for form
  onSubmit(): void {
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }

    //form submission with htttp post
    this.loading = true;
    const formData = this.contactForm.value;
    
    //api call
    this.http.post<any>('https://jsonplaceholder.typicode.com/posts', {
      title: `Contact from ${formData.name}`,
      body: formData.message,
      userId: 1
    }).subscribe({
      next: (response) => {
        this.formSubmitted = true;
        this.loading = false;
        console.log('Form submitted successfully:', response);
        
        setTimeout(() => {
          this.formSubmitted = false;
          this.submitted = false;
          this.contactForm.reset();
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to submit form';
        this.loading = false;
        console.error('Form submission error:', error);
      }
    });
  }

  //business logic for user 
  selectUser(user: User): void {
    this.selectedUser = user;
  }

  //refresh data business logic
  refreshData(): void {
    this.loadUsers();
    this.loadPosts();
    this.selectedUser = null;
  }

  //form field validation
  isFieldInvalid(field: string): boolean {
    const formField = this.contactForm.get(field);
    return !!(formField && formField.invalid && (formField.dirty || formField.touched || this.submitted));
  }

  //validation error message
  getErrorMessage(field: string): string {
    const formField = this.contactForm.get(field);
    if (formField?.errors) {
      if (formField.errors['required']) return `${field} is required`;
      if (formField.errors['email']) return 'Please enter a valid email';
      if (formField.errors['minlength']) return `${field} is too short`;
      if (formField.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';
  }
}