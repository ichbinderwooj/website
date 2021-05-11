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
- [pug](https://www.npmjs.com/package/pug)
- [nodemailer](https://www.npmjs.com/package/nodemailer)
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
    "title": "thPoéo thCocán Altorn Onécmdf Bec Bftf",
    "author_id": 1,
    "content": "Cocánb altort, ürpenîtort ürodictort ürişêxu áaç tivitin volvinãp plicat īóopaioc onşt rictiot thpení otês ticlen onkdd cłdeğse egřbk degsbáal fýhginkf bňdřbň lobec seřbsi. Thîmain vòlvdir ectlpá infuác tiviti, esücağ énitap iercinŵap, lagenít, aspan, kiñşqué ezinb, albüs tingen, itafløg, ginürethrap, latickłt ortú, rerotielec trøstim ulatiok, néeinok ickinnons dýce gýhlgşjħd sbłggħx cýdłggh gildggłg ghlhýd efegč fňřg gřbgg. Thrécipie nosûcác tiviti émareç eivdir ecphýş icaple asurvim asochísœ, motionâp leasürt hrouğe rôti chumili, atióok noŵledgt hath plaipléa sint sadis tidomin antnon ectifbh dşjýčeğtflħe hačmir bliehhğclčfň křbeit decýds bgho báachth. Manóth éspraç tičecarrsiğ nifîca nħéal trisk nonýdf béesi yetkħfse.",
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
### `code GET /info`
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