# Authentication and Display of Notebooks/Chapters

This documentation outlines how notebooks and chapters are displayed on the sidebar and loaded based on user authentication in the current codebase.

## Overview

The application uses a combination of backend and frontend components to authenticate users and display their personalized notebooks and chapters. The key components involved are:

- **Backend**: Express.js server, MongoDB with Mongoose models, authentication middleware.
- **Frontend**: Next.js application, with pages and components that interact with the backend API.

## Authentication Flow

### 1. User Authentication

- **Authentication Middleware** (`middlewares/auth.js`):
  - Checks for a JWT token in the `Authorization` header of incoming requests.
  - If the token is valid, it decodes the token and attaches the user information to `req.user`.
  - If the token is missing or invalid, it redirects the user to the login page.

- **Auth Routes** (`routes/authRoutes.js`):
  - Handles endpoints related to authentication, such as `/auth/google` for Google OAuth.
  - After successful authentication, it creates a JWT token and sends it to the client.

### 2. JWT Token Generation

- Upon successful login, a JWT token is generated containing the user's ID and other relevant information.
- The token is sent to the frontend and stored (typically in localStorage or cookies).

## Notebook and Chapter Retrieval

### 1. Backend Routes

- **Notebook Routes** (`routes/notebookroutes.js`):

  - `GET /api/notebooks`: Retrieves all notebooks accessible to the authenticated user.
    - Uses `ensureAuthenticated` middleware to ensure the user is authenticated.
    - Queries the `Note` model for notebooks where the user is the owner, an admin, or has view access.

  - `GET /api/notes`: Alias or related endpoint to fetch notes (notebooks).

  - **Example**:

    ```javascript
    router.get('/notes', ensureAuthenticated, async (req, res) => {
      const notes = await Note.find({
        $or: [
          { user: req.user._id },
          { admins: req.user._id },
          { viewAccessOnly: req.user._id }
        ]
      });
      res.status(200).json(notes);
    });
    ```

### 2. Mongoose Models

- **Note Model** (`models/note.js`):

  - Represents a notebook.
  - Fields:
    - `title`: Title of the notebook.
    - `content`: Content of the notebook.
    - `user`: Owner of the notebook.
    - `admins`: Users with admin access to the notebook.
    - `viewAccessOnly`: Users with view-only access.

- **MCQ Model** (`models/mcq.js`):

  - Represents chapters or questions associated with a notebook.
  - Fields:
    - `noteId`: Reference to the parent notebook.
    - Other fields related to the question content.

### 3. Frontend Components

- **Sidebar Component**:

  - **Location**: Likely in a file like `components/Sidebar.js` or within page components.
  - On component mount, it fetches the list of notebooks from the backend API.
  - **API Call**:

    ```javascript
    // Example using fetch or Axios
    const response = await fetch('/api/notes', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const notebooks = await response.json();
    ```

  - Displays the notebooks in the sidebar.
  - When a notebook is selected, it fetches the chapters or notes associated with that notebook.

- **State Management**:

  - Uses React state or a state management library (e.g., Redux, Context API) to store and manage the notebooks and chapters.

### 4. Handling User Interaction

- When the user clicks on a notebook in the sidebar:

  1. The application checks if the notebook is already loaded; if not, it fetches it from the backend.
  2. Makes an authenticated request to `/api/notes/:id` to retrieve the notebook details and associated chapters.
  3. Updates the state to display the chapters in the main content area.

## Access Control

- **Backend Validation**:

  - Before returning any notebooks or chapters, the backend checks if the authenticated user has the necessary permissions.
  - This is done using the `ensureAuthenticated` middleware and querying the `Note` model with conditions that include:
    - Ownership (`user: req.user._id`).
    - Admin access (`admins: req.user._id`).
    - View-only access (`viewAccessOnly: req.user._id`).

- **Error Handling**:

  - If a user tries to access a notebook or chapter they don't have access to, the backend returns a 403 Forbidden error.
  - The frontend handles this by showing an appropriate message or redirecting the user.

## File Structure and Relevant Files

- **Backend**:

  - `middlewares/auth.js`: Authentication middleware that verifies JWT tokens.
  - `routes/authRoutes.js`: Handles authentication-related routes.
  - `routes/notebookroutes.js`: Contains routes for notebooks and chapters.
  - `models/note.js`: Mongoose model for notebooks.
  - `models/user.js`: Mongoose model for users.
  - `models/mcq.js`: Mongoose model for chapters/questions.

- **Frontend**:

  - `components/Sidebar.js`: Component that renders the sidebar with notebooks.
  - `pages/index.js`: Main page that includes the sidebar and content area.
  - `utils/api.js`: Utility functions for making API calls.

## Sequence of Operations

1. **User Authentication**:

   - User logs in via Google OAuth or other methods.
   - Receives a JWT token upon successful authentication.

2. **Fetching Notebooks**:

   - The Sidebar component mounts and initiates an API call to `/api/notes` with the JWT token.
   - The backend validates the token and retrieves notebooks accessible to the user.
   - The notebooks are displayed in the sidebar.

3. **Displaying Chapters**:

   - When a notebook is selected, the application fetches chapters associated with that notebook.
   - Makes an API call to `/api/notes/:id` or a dedicated chapters endpoint.
   - The chapters are displayed in the content area.

4. **Continuous Interaction**:

   - Users can navigate between notebooks and chapters.
   - All requests are authenticated, ensuring secure data access.

## Important Considerations

- **Token Management**:

  - The JWT token must be included in the `Authorization` header for all authenticated requests.
  - Handle token expiration by refreshing tokens or redirecting users to log in again.

- **Security**:

  - Sensitive data should never be exposed on the frontend.
  - Ensure proper error handling to avoid leaking information.

- **Performance**:

  - Consider caching notebooks and chapters to reduce API calls.
  - Use pagination or lazy loading if there are many notebooks or chapters.

## Conclusion

This setup ensures that notebooks and chapters are securely displayed based on user authentication. By integrating the authentication middleware, backend routes, and frontend components, the application provides a seamless experience for users to access their personalized content.

Here are the relevant file names from your codebase that you can share with your colleague for this effort:

Backend Files
/middlewares/auth.js
/routes/authRoutes.js
/routes/notebookroutes.js
/routes/notebookshare.js
/models/Notebook.js
/models/ShortenedUrl.js
/models/User.js
/routes/similarRequestData.json
Frontend Files
/components/Sidebar.js
/pages/index.js
/utils/api.js
Documentation
/backend/auth_notebooks_chapters.txt
These files are involved in the authentication process and the display of notebooks and chapters based on user permissions. Sharing them will help your colleague understand how notebooks and chapters are managed in the application.