import { Injectable } from '@angular/core';
import { Post } from './post.model';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostService {
 private posts: Post[] = [];
 private postsUpdated = new Subject<{ posts: Post[], totalPosts: number}>();
  constructor(private http: HttpClient, private router: Router) { }

  getPost( postId: string) {
    return this.http.get<Post>('http://localhost:3000/api/posts/' + postId);
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const params = new HttpParams()
    .set('pageSize', postsPerPage.toString())
    .set('currentPage', currentPage.toString());

    this.http.get<{posts: Post[], totalPosts: number}>('http://localhost:3000/api/posts', {params: params})
    // .pipe(map(postData1 => {
    //   console.log(postData1);
    //   return postData1.map((post) => {
    //     console.log(post);
    //     return post;
    //   });
    // }))
    .subscribe(
      (postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next({posts: [...this.posts], totalPosts: postData.totalPosts});
      }
    );
  }

  getPostUpdatedListner() {
    return this.postsUpdated.asObservable();
  }


  addPost(post: Post) {
    // Now we are updating the post methed to post file data as well
    // Json does not allow to send the BLOB
    // FormData() object provided by javascript
    const postData = new FormData();
    postData.append('title', post.title);
    postData.append('content', post.content);
    postData.append('image', post.image, post.title);

    console.log('postData form post service', postData);
    this.http.post('http://localhost:3000/api/posts',
    // instead of post now we will send postData
     postData)
    .subscribe( (responseData: Post) => {
      this.router.navigate(['/']);
    });
  }

  updatePost(post: Post) {
    console.log('Post from update post *****', post);
    let postData: Post | FormData;
    if (typeof(post.image) !== 'string') {
      postData = new FormData();
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', post.image, post.title);
      console.log('postData', postData);
    } else {
      postData = post;
    }
    this.http.put('http://localhost:3000/api/posts/' + post._id, postData)
    .subscribe( (responseData: Post) => {
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string): any {
   return  this.http.delete('http://localhost:3000/api/posts/' + postId);
  }

}
