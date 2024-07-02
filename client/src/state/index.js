import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    deleteUser: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const deleteUserAsync = createAsyncThunk(
  "auth/deleteUser",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().token;
      const response = await axios.delete(`/auth/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.msg === "User deleted successfully.") {
        return userId;
      }
      return thunkAPI.rejectWithValue("Failed to delete user");
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost } =
  authSlice.actions;
export default authSlice.reducer;
