import { Injectable, signal } from '@angular/core';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private readonly loading = signal<boolean>(false);
  
  public readonly isLoading = this.loading.asReadonly();

  async fetchPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    this.loading.set(true);
    
    try {
      const start = (page - 1) * limit;
      
      // Fetch posts with pagination
      const postsResponse = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_limit=${limit}&_start=${start}`
      );
      
      if (!postsResponse.ok) {
        throw new Error(`HTTP error! status: ${postsResponse.status}`);
      }
      
      const posts: Post[] = await postsResponse.json();
      
      // JSONPlaceholder has 100 posts total, but let's simulate a larger dataset
      const totalPosts = 100;
      
      return {
        posts,
        total: totalPosts,
        page,
        limit
      };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }
}