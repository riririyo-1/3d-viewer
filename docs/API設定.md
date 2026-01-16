# API 設定

## OpenAPI 仕様

```yaml
openapi: 3.0.3

info:
  title: Studio View API
  version: 1.0.0
  description: 3DビューワーアプリケーションのバックエンドAPI

servers:
  - url: http://localhost:4000/api
    description: ローカル開発環境
  - url: https://api.studio-view.com/api
    description: 本番環境

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Asset:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        name:
          type: string
        type:
          type: string
          enum: [obj, glb, gltf]
        size:
          type: integer
        s3Key:
          type: string
        thumbnailUrl:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        plan:
          type: string
          enum: [free, pro, enterprise]
        language:
          type: string
          enum: [ja, en]
        storage:
          type: object
          properties:
            used:
              type: integer
            limit:
              type: integer
            usedPercent:
              type: number

    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        statusCode:
          type: integer
        timestamp:
          type: string
          format: date-time

paths:
  /auth/login:
    post:
      summary: ユーザーログイン
      tags: [Auth]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        "200":
          description: ログイン成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  userId:
                    type: string
                  email:
                    type: string
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
                  expiresIn:
                    type: integer
        "401":
          description: 認証エラー
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /auth/logout:
    post:
      summary: ユーザーログアウト
      tags: [Auth]
      security:
        - bearerAuth: []
      responses:
        "200":
          description: ログアウト成功

  /assets:
    get:
      summary: アセット一覧取得
      tags: [Assets]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: type
          in: query
          schema:
            type: string
            enum: [obj, glb, gltf]
      responses:
        "200":
          description: アセット一覧
          content:
            application/json:
              schema:
                type: object
                properties:
                  assets:
                    type: array
                    items:
                      $ref: "#/components/schemas/Asset"
                  pagination:
                    type: object
                    properties:
                      total:
                        type: integer
                      page:
                        type: integer
                      limit:
                        type: integer
                      totalPages:
                        type: integer

    post:
      summary: アセットアップロード
      tags: [Assets]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                name:
                  type: string
      responses:
        "201":
          description: アップロード成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  asset:
                    $ref: "#/components/schemas/Asset"
        "400":
          description: バリデーションエラー
        "413":
          description: ファイルサイズ超過

  /assets/{id}:
    get:
      summary: アセット詳細取得
      tags: [Assets]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: アセット詳細
          content:
            application/json:
              schema:
                type: object
                properties:
                  asset:
                    $ref: "#/components/schemas/Asset"
        "404":
          description: アセット未発見

    delete:
      summary: アセット削除
      tags: [Assets]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: 削除成功
        "403":
          description: 権限不足

  /conversion/obj2glb:
    post:
      summary: OBJ→GLB変換
      tags: [Conversion]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                saveToLibrary:
                  type: boolean
                  default: false
      responses:
        "200":
          description: 変換成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  convertedFile:
                    type: object
                    properties:
                      downloadUrl:
                        type: string
                      expiresIn:
                        type: integer
                      size:
                        type: integer
        "400":
          description: 変換失敗

  /conversion/obj2gltf:
    post:
      summary: OBJ→GLTF変換
      tags: [Conversion]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                saveToLibrary:
                  type: boolean
      responses:
        "200":
          description: 変換成功

  /library/models:
    get:
      summary: パブリックモデル一覧
      tags: [Library]
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [obj, glb, gltf]
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        "200":
          description: モデル一覧
          content:
            application/json:
              schema:
                type: object
                properties:
                  models:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        name:
                          type: string
                        category:
                          type: string
                        url:
                          type: string
                        thumbnailUrl:
                          type: string
                        description:
                          type: string

  /settings:
    get:
      summary: ユーザー設定取得
      tags: [Settings]
      security:
        - bearerAuth: []
      responses:
        "200":
          description: 設定情報
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"

    patch:
      summary: ユーザー設定更新
      tags: [Settings]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                language:
                  type: string
                  enum: [ja, en]
      responses:
        "200":
          description: 更新成功

  /history/recent:
    get:
      summary: 最近開いたアセット取得
      tags: [History]
      security:
        - bearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 8
            maximum: 20
      responses:
        "200":
          description: 閲覧履歴
          content:
            application/json:
              schema:
                type: object
                properties:
                  recentAssets:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        name:
                          type: string
                        type:
                          type: string
                        thumbnailUrl:
                          type: string
                        lastOpenedAt:
                          type: string
                          format: date-time

    post:
      summary: 閲覧履歴追加
      tags: [History]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                assetId:
                  type: string
                  format: uuid
      responses:
        "200":
          description: 履歴更新成功

tags:
  - name: Auth
    description: 認証関連
  - name: Assets
    description: アセット管理
  - name: Conversion
    description: ファイル形式変換
  - name: Library
    description: パブリックライブラリ
  - name: Settings
    description: ユーザー設定
  - name: History
    description: 閲覧履歴
```
