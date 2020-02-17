## WhoIsComingTo.Party

### Demo

https://whoiscomingto.party

### Installation

`cd functions && npm i && npm run setup`

`firebase deploy`

### About

With all the craze about Machine Learning nowadays, I wish to try my hands on this technology especially Face Recognition. But unfortunately if you are just a humble software developer it will be a long journey. But luckily when I'm scrolling around in Github, I found this awesome library which is called [face-api.js](https://github.com/justadudewhohacks/face-api.js).

### FAQ

1. What are the necessary files needed to use the library?
- You need the Tensorflow saved models. Luckily for you these are already saved in the library repo in `weights` folder so you can just copy from it.


2. What kind of data that I will store in database?
- It is called `descriptor`. The data is in array of 128 float numbers e.g `[-0.029340924695134163, -0.13368940353393555, 0.1174287348985672, ... (total 128) ]`. One people can have many `descriptor` to make the recognition more accurate. So when you are retrieving the data from your database, you might want to output into following JSON format;
```
	[
		{
			label: 'person 1',
			descriptors: [descriptor1array]
		},
		{
			label: 'another person',
			descriptors: [descriptor2array, descriptor3array]
		}
	]
```

3. Do I really need to make some face expressions in the data training to make the recognition more accurate?
- No, I just having fun since the face expression recognition function is available. Plus it also work like some kind of authorisation since anyone can take your picture, but no one can make you making those face expressions. Unless you are a famous person and your picture in different expression is everywhere online.

### License

Licensed under the [MIT license](http://opensource.org/licenses/MIT)
