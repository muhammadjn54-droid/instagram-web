import type { OpenAPIObject } from '@nestjs/swagger';

export const swaggerDocument: OpenAPIObject = {
  "openapi": "3.0.1",
  "info": {
    "title": "Instagram API (NestJS)",
    "description": "Instagram Clone Backend API Documentation powered by NestJS Swagger",
    "contact": {
      "name": "Quiz"
    },
    "version": "v1.0"
  },
  "paths": {
    "/Account/register": {
      "post": {
        "tags": [
          "Account"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.RegisterDto.RegisterDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.RegisterDto.RegisterDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.RegisterDto.RegisterDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Account/login": {
      "post": {
        "tags": [
          "Account"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LoginDto.LoginDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LoginDto.LoginDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LoginDto.LoginDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Account/ForgotPassword": {
      "delete": {
        "tags": [
          "Account"
        ],
        "parameters": [
          {
            "name": "Email",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              }
            }
          }
        }
      }
    },
    "/Account/ResetPassword": {
      "delete": {
        "tags": [
          "Account"
        ],
        "parameters": [
          {
            "name": "Token",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Email",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Password",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string",
              "format": "password"
            }
          },
          {
            "name": "ConfirmPassword",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string",
              "format": "password"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              }
            }
          }
        }
      }
    },
    "/Account/ChangePassword": {
      "put": {
        "tags": [
          "Account"
        ],
        "parameters": [
          {
            "name": "OldPassword",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Password",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string",
              "format": "password"
            }
          },
          {
            "name": "ConfirmPassword",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string",
              "format": "password"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              }
            }
          }
        }
      }
    },
    "/Chat/get-chats": {
      "get": {
        "tags": [
          "Chat"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Chat/get-chat-by-id": {
      "get": {
        "tags": [
          "Chat"
        ],
        "parameters": [
          {
            "name": "chatId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Chat/create-chat": {
      "post": {
        "tags": [
          "Chat"
        ],
        "parameters": [
          {
            "name": "receiverUserId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Chat/send-message": {
      "put": {
        "tags": [
          "Chat"
        ],
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "required": [
                  "ChatId"
                ],
                "type": "object",
                "properties": {
                  "ChatId": {
                    "type": "integer",
                    "format": "int32"
                  },
                  "MessageText": {
                    "type": "string"
                  },
                  "File": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              },
              "encoding": {
                "ChatId": {
                  "style": "form"
                },
                "MessageText": {
                  "style": "form"
                },
                "File": {
                  "style": "form"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Chat/delete-message": {
      "delete": {
        "tags": [
          "Chat"
        ],
        "parameters": [
          {
            "name": "massageId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Chat/delete-chat": {
      "delete": {
        "tags": [
          "Chat"
        ],
        "parameters": [
          {
            "name": "chatId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/FollowingRelationShip/get-subscribers": {
      "get": {
        "tags": [
          "FollowingRelationShip"
        ],
        "parameters": [
          {
            "name": "UserId",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/FollowingRelationShip/get-subscriptions": {
      "get": {
        "tags": [
          "FollowingRelationShip"
        ],
        "parameters": [
          {
            "name": "UserId",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/FollowingRelationShip/add-following-relation-ship": {
      "post": {
        "tags": [
          "FollowingRelationShip"
        ],
        "parameters": [
          {
            "name": "followingUserId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/FollowingRelationShip/delete-following-relation-ship": {
      "delete": {
        "tags": [
          "FollowingRelationShip"
        ],
        "parameters": [
          {
            "name": "followingUserId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Location/get-Locations": {
      "get": {
        "tags": [
          "Location"
        ],
        "parameters": [
          {
            "name": "City",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "State",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "ZipCode",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Country",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "PageNumber",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Location/get-Location-by-id": {
      "get": {
        "tags": [
          "Location"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Location/add-Location": {
      "post": {
        "tags": [
          "Location"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LocationDto.AddLocationDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LocationDto.AddLocationDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LocationDto.AddLocationDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Location/update-Location": {
      "put": {
        "tags": [
          "Location"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LocationDto.UpdateLocationDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LocationDto.UpdateLocationDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.LocationDto.UpdateLocationDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Location/delete-Location": {
      "delete": {
        "tags": [
          "Location"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/get-posts": {
      "get": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "UserId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Title",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Content",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "PageNumber",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/get-reels": {
      "get": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "PageNumber",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/get-post-by-id": {
      "get": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/get-my-posts": {
      "get": {
        "tags": [
          "Post"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/get-following-post": {
      "get": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "UserId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "PageNumber",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/add-post": {
      "post": {
        "tags": [
          "Post"
        ],
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "required": [
                  "Images"
                ],
                "type": "object",
                "properties": {
                  "Title": {
                    "type": "string"
                  },
                  "Content": {
                    "type": "string"
                  },
                  "Images": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              },
              "encoding": {
                "Title": {
                  "style": "form"
                },
                "Content": {
                  "style": "form"
                },
                "Images": {
                  "style": "form"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/delete-post": {
      "delete": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/like-post": {
      "post": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "postId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/view-post": {
      "post": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "postId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/add-comment": {
      "post": {
        "tags": [
          "Post"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.PostCommentDto.AddPostCommentDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.PostCommentDto.AddPostCommentDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.PostCommentDto.AddPostCommentDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/delete-comment": {
      "delete": {
        "tags": [
          "Post"
        ],
        "parameters": [
          {
            "name": "commentId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Post/add-post-favorite": {
      "post": {
        "tags": [
          "Post"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.PostFavoriteDto.AddPostFavoriteDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.PostFavoriteDto.AddPostFavoriteDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.PostFavoriteDto.AddPostFavoriteDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Story/get-stories": {
      "get": {
        "tags": [
          "Story"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Story/get-user-stories/{userId}": {
      "get": {
        "tags": [
          "Story"
        ],
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "style": "simple",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Story/get-my-stories": {
      "get": {
        "tags": [
          "Story"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/Story/LikeStory": {
      "post": {
        "tags": [
          "Story"
        ],
        "parameters": [
          {
            "name": "storyId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              }
            }
          }
        }
      }
    },
    "/Story/GetStoryById": {
      "get": {
        "tags": [
          "Story"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[Domain.Dtos.StoryDtos.GetStoryDto]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[Domain.Dtos.StoryDtos.GetStoryDto]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[Domain.Dtos.StoryDtos.GetStoryDto]"
                }
              }
            }
          }
        }
      }
    },
    "/Story/AddStories": {
      "post": {
        "tags": [
          "Story"
        ],
        "parameters": [
          {
            "name": "PostId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "Image": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              },
              "encoding": {
                "Image": {
                  "style": "form"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.String]"
                }
              }
            }
          }
        }
      }
    },
    "/Story/DeleteStory": {
      "delete": {
        "tags": [
          "Story"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.Boolean]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.Boolean]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[System.Boolean]"
                }
              }
            }
          }
        }
      }
    },
    "/Story/add-story-view": {
      "post": {
        "tags": [
          "Story"
        ],
        "parameters": [
          {
            "name": "StoryId",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[Domain.Dtos.StoryViewDtos.GetStoryViewDto]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[Domain.Dtos.StoryViewDtos.GetStoryViewDto]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Domain.Responses.Response`1[Domain.Dtos.StoryViewDtos.GetStoryViewDto]"
                }
              }
            }
          }
        }
      }
    },
    "/User/get-users": {
      "get": {
        "tags": [
          "User"
        ],
        "parameters": [
          {
            "name": "UserName",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Email",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "PageNumber",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/add-search-history": {
      "post": {
        "tags": [
          "User"
        ],
        "parameters": [
          {
            "name": "Text",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/get-search-histories": {
      "get": {
        "tags": [
          "User"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/delete-search-history": {
      "delete": {
        "tags": [
          "User"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/delete-search-histories": {
      "delete": {
        "tags": [
          "User"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/add-user-search-history": {
      "post": {
        "tags": [
          "User"
        ],
        "parameters": [
          {
            "name": "UserSearchId",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/get-user-search-histories": {
      "get": {
        "tags": [
          "User"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/delete-user-search-history": {
      "delete": {
        "tags": [
          "User"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": true,
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/delete-user-search-histories": {
      "delete": {
        "tags": [
          "User"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/User/delete-user": {
      "delete": {
        "tags": [
          "User"
        ],
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/UserProfile/get-user-profile-by-id": {
      "get": {
        "tags": [
          "UserProfile"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/UserProfile/get-is-follow-user-profile-by-id": {
      "get": {
        "tags": [
          "UserProfile"
        ],
        "parameters": [
          {
            "name": "followingUserId",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/UserProfile/get-my-profile": {
      "get": {
        "tags": [
          "UserProfile"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/UserProfile/update-user-profile": {
      "put": {
        "tags": [
          "UserProfile"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.UserProfileDto.UpdateUserProfileDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.UserProfileDto.UpdateUserProfileDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/Domain.Dtos.UserProfileDto.UpdateUserProfileDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/UserProfile/get-post-favorites": {
      "get": {
        "tags": [
          "UserProfile"
        ],
        "parameters": [
          {
            "name": "PageNumber",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "style": "form",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/UserProfile/update-user-image-profile": {
      "put": {
        "tags": [
          "UserProfile"
        ],
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "imageFile": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              },
              "encoding": {
                "imageFile": {
                  "style": "form"
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/UserProfile/delete-user-image-profile": {
      "delete": {
        "tags": [
          "UserProfile"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Domain.Dtos.LocationDto.AddLocationDto": {
        "required": [
          "city",
          "country",
          "state",
          "zipCode"
        ],
        "type": "object",
        "properties": {
          "city": {
            "minLength": 1,
            "type": "string"
          },
          "state": {
            "minLength": 1,
            "type": "string"
          },
          "zipCode": {
            "minLength": 1,
            "type": "string"
          },
          "country": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.LocationDto.UpdateLocationDto": {
        "required": [
          "city",
          "country",
          "locationId",
          "state",
          "zipCode"
        ],
        "type": "object",
        "properties": {
          "locationId": {
            "type": "integer",
            "format": "int32"
          },
          "city": {
            "minLength": 1,
            "type": "string"
          },
          "state": {
            "minLength": 1,
            "type": "string"
          },
          "zipCode": {
            "minLength": 1,
            "type": "string"
          },
          "country": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.LoginDto.LoginDto": {
        "required": [
          "password",
          "userName"
        ],
        "type": "object",
        "properties": {
          "userName": {
            "minLength": 1,
            "type": "string"
          },
          "password": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.PostCommentDto.AddPostCommentDto": {
        "required": [
          "comment",
          "postId"
        ],
        "type": "object",
        "properties": {
          "comment": {
            "minLength": 1,
            "type": "string"
          },
          "postId": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.PostFavoriteDto.AddPostFavoriteDto": {
        "required": [
          "postId"
        ],
        "type": "object",
        "properties": {
          "postId": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.RegisterDto.RegisterDto": {
        "required": [
          "confirmPassword",
          "email",
          "fullName",
          "password",
          "userName"
        ],
        "type": "object",
        "properties": {
          "userName": {
            "minLength": 1,
            "type": "string"
          },
          "fullName": {
            "minLength": 1,
            "type": "string"
          },
          "email": {
            "minLength": 1,
            "type": "string"
          },
          "password": {
            "minLength": 1,
            "type": "string",
            "format": "password"
          },
          "confirmPassword": {
            "minLength": 1,
            "type": "string",
            "format": "password"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.StoryDtos.GetStoryDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "fileName": {
            "type": "string",
            "nullable": true
          },
          "postId": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "createAt": {
            "type": "string",
            "format": "date-time"
          },
          "userId": {
            "type": "string",
            "nullable": true
          },
          "userAvatar": {
            "type": "string",
            "nullable": true
          },
          "viewerDto": {
            "$ref": "#/components/schemas/Domain.Dtos.ViewerDtos.ViewerDto"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.StoryViewDtos.GetStoryViewDto": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "format": "int32"
          },
          "viewUserId": {
            "type": "string",
            "nullable": true
          },
          "storyId": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.UserProfileDto.UpdateUserProfileDto": {
        "type": "object",
        "properties": {
          "about": {
            "type": "string",
            "nullable": true
          },
          "gender": {
            "$ref": "#/components/schemas/Domain.Enums.Gender"
          }
        },
        "additionalProperties": false
      },
      "Domain.Dtos.ViewerDtos.ViewerDto": {
        "type": "object",
        "properties": {
          "userName": {
            "type": "string",
            "nullable": true
          },
          "name": {
            "type": "string",
            "nullable": true
          },
          "viewCount": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "viewLike": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "Domain.Enums.Gender": {
        "enum": [
          0,
          1
        ],
        "type": "integer",
        "format": "int32"
      },
      "Domain.Responses.Response`1[Domain.Dtos.StoryDtos.GetStoryDto]": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/Domain.Dtos.StoryDtos.GetStoryDto"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "statusCode": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "Domain.Responses.Response`1[Domain.Dtos.StoryViewDtos.GetStoryViewDto]": {
        "type": "object",
        "properties": {
          "data": {
            "$ref": "#/components/schemas/Domain.Dtos.StoryViewDtos.GetStoryViewDto"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "statusCode": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "Domain.Responses.Response`1[System.Boolean]": {
        "type": "object",
        "properties": {
          "data": {
            "type": "boolean"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "statusCode": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "Domain.Responses.Response`1[System.String]": {
        "type": "object",
        "properties": {
          "data": {
            "type": "string",
            "nullable": true
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "statusCode": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      }
    },
    "securitySchemes": {
      "Bearer": {
        "type": "apiKey",
        "description": "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abc-def\"",
        "name": "Authorization",
        "in": "header"
      }
    }
  },
  "security": [
    {
      "Bearer": []
    }
  ]
} as unknown as OpenAPIObject;
