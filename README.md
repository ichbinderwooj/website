# [sonwoojin.com](http://sonwoojin.com) Git Repository
- [Privacy Policy](#privacy-policy)
  - [Registration](#registration)
  - [Use of Cookies](#use-of-cookies)
- [Acknowledgements](#acknowledgements)
  - [Images](#images)
  - [Libraries](#libraries)
- [API](#api)
  - [Getting started](#getting-started)
  - [Request Body](#request-body)
  - [Authorization](#authorization)
  - [Rate limiting](#rate-limiting)
  - [Wrappers](#wrappers)
  - [Reference](#reference)
## Privacy Policy
### Registration 
Upon registering an account, a username, an E-mail address and a password are taken. The username is used to identify the user and is publicly available. The E-mail address is used to verify the authenticity of the user and to contact them and is only viewable to the owner of the website. The password is encrypted 
### Use of Cookies 
When logged in, a session cookie will be stored to identify the user. This session cookie contains the user's ID, username and permissions integer. A cookie is also stored upon confirming the cookie notice. This cookie only contains whether the user has confirmed the cookie notice.
## Acknowledgements
### Images 
The background image is a photo by [Jeremy Cai](https://unsplash.com/@j?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com).
### Libraries 
This website uses the following libraries: bcrypt
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- [express](https://www.npmjs.com/package/express)
- [express-session](https://www.npmjs.com/package/express-session)
- [md5](https://www.npmjs.com/package/md5)
- [mysql](https://www.npmjs.com/package/mysql)
- [nodemailer](https://www.npmjs.com/package/nodemailer)
- [pug](https://www.npmjs.com/package/pug)
- [showdown](https://www.npmjs.com/package/showdown)
- [turndown](https://www.npmjs.com/package/turndown)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [FontAwesome Icons](https://fontawesome.com)
- [jQuery](https://jquery.com)
- [PrismJS](https://prismjs.com)
## API
The sonwoojin.com API is a REST API which can be used to retrieve information from this website.
### Getting started 
To use the API, you must obtain a token. You can get a token from your [profile](http://sonwoojin.com/community/profile).
### Request Body 
All requests have to be made in the urlencoded format.
### Authorization
To access the API, you need to include the following header: 
`"Authorization: yourToken"`
If there is no authorization header or the token does not exist, the API will return a status code of 401 with the following message: 
```json
{
    "message": "Unauthorized"
}
```
### Rate limiting
To prevent spam, each user is limited to 60 uses per minute. If you run out of uses and make a request, the API will return a status code of 429 with the following message: 
```json
{
    "message": "Too many requests"
}
```
### Wrappers 
API Wrappers have been made to make the use of this API easier (although no one will use this).
#### Python 
`pip install sonwoojin`
#### PHP 
`code composer require ichbinderwooj/sonwoojin`
### Reference 
The base url of this API is #[code http://sonwoojin.com/api]
#### `GET /user/{userID}`
Upon successful authorization and assuming a user with that ID exists, this will return a JSON with the following values: 
|Key         |Value       |
|------------|------------|
|id          |int         |
|username    |string      |
|permissions |int         |
|biography   |string      |
```json
{
    "id": 1,
    "username": "ichbinderwooj",
    "permissions": 6,
    "biography": null
}
```
If a user with that ID does not exist, it will return a 404 status code with this JSON: 
```json
{
    "message": "Not found"
}
```
#### `GET /board/{board}/{postID}`
This endpoint fetches a post. The #[code board] parameter specifies which board should be queried. It can be either `forum` or `announcements`. Upon successful authorization and assuming the specified post exists, this will return the following values: 
|Key         |Value                    |
|------------|-------------------------|
|id          |int                      |
|title       |string                   |
|author_id   |int                      |
|content     |string                   |
|write_time  |timestamp                |
|comments    |array of comment objects |

For example:
```json
{
    "id": 1,
    "title": "thPo??o thCoc??n Altorn On??cmdf Bec Bftf",
    "author_id": 1,
    "content": "Coc??nb altort, ??rpen??tort ??rodictort ??ri????xu ??a?? tivitin volvin??p plicat ????opaioc on??t rictiot thpen?? ot??s ticlen onkdd c??de??se eg??bk degsb??al f??hginkf b??d??b?? lobec se??bsi. Th??main v??lvdir ectlp?? infu??c tiviti, es??ca?? ??nitap iercin??ap, lagen??t, aspan, ki????qu?? ezinb, alb??s tingen, itafl??g, gin??rethrap, latick??t ort??, rerotielec tr??stim ulatiok, n??einok ickinnons d??ce g??hlg??j??d sb??gg??x c??d??ggh gildgg??g ghlh??d efeg?? f????g g??bgg. Thr??cipie nos??c??c tiviti ??mare?? eivdir ecph???? icaple asurvim asoch??s??, motion??p leas??rt hrou??e r??ti chumili, ati??ok no??ledgt hath plaipl??a sint sadis tidomin antnon ectifbh d??j????e??tfl??e ha??mir bliehh??cl??f?? k??beit dec??ds bgho b??achth. Man??th ??spra?? ti??ecarrsi?? nif??ca n????al trisk non??df b??esi yetk??fse.",
    "write_time": "2021-05-05T23:58:24.000Z",
    "comments": [
        {
            "id": 3,
            "author_id": 1,
            "content": "This is a comment.",
            "write_time": "2021-05-06T19:05:15.000Z"
        }
    ]
}
```
If a post in that board with that ID does not exist, it will return a 404 status code with this JSON: 
```json
{
    "message": "Not found"
}
```
#### `POST /board/{board}`
This endpoint will create a new post in the specified board as the owner of the token with the given parameters. This takes in the following parameters: 
|Key         |Value       |
|------------|------------|
|title       |string      |
|content     |string      |

Upon a successful request, this will return a status code of 201.
#### `PATCH /board/{board}/{postID}`
Upon successful authorization, this endpoint edits the specified post and returns the data regarding the submitted post. (See `POST /board/{board}`). If the post does not exist, this will return: 
```json
{
    "message": "Not found"
}
```
#### `DELETE /board/{board}/{postID}`
Upon successful authorization, this endpoint deletes the specified post and returns this with a status code of 204: 
```json
{
    "message": "No content"
}
```
If the post does not exist, this will return: 
```json
{
    "message": "Not found"
}
```
#### `GET /info`
Upon successful authorization, this endpoint returns a JSON with the following values: 
|Key         |Value       |
|------------|------------|
|user_perms  |int         |
|uses        |int         |

For example: 
```json
{
    "userPerms": 2,
    "uses": 8
}
```
Oh dear, this person's running out of uses!
