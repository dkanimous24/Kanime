# setting up the frontend and backend connection(note :pseudo functions name were used for familiarity)

## first step after django installations

after installing your projects and adding your apps to settings,added the keys ,allowed_origin,set debug to [true] ,added the allowed hostt etc ,in order to actually set up the connection you go the Core folder (which is a app that you made for your django project) you create a small function to render the status of ok ,(personal view: I believe the standard convention is to use json to render the status : ok)

## to recall

i could not remember the imports when i tried to do it myself,so hear they are :

### for the views you import the json response module

django.https import jsonResponse(note these are not exact none to one representation of the code just to represent the basic ideas)

### for urls make sure you remember the path and include

django.urls import path,include
path("pathUrl",model.function,name) (for the app itself)
path("pathUrl",include("apps.urls")) (for the main url)

## create a superuser

[important] make sure you make migrations first
then run [python manage.py createsuperuser]
you now have a simple location that you can check your database ,users etc

now that all of this done, how do we know set it up the actual connection....

## go back to the frontend

write a simple function [backendStatus()] that will fetch the url of the health it should return a simple Paragraph saying either connected or failed

now because of CORS it will fail so we have to fix that

### go back to the setting of backend and add the nessecary configurations

in the apps add [corsheaders]
and in the middleware add this to the config ["corsheaders.middleware.CorsMiddleware"]
you should no longer get the error

### set up the proxy

go into your vite config file and add the latest endpoint to it and and change the origin in the actual address of the backend since the allowed origin has already been done in the env file no need to add into the code since it is already there and finally set change origin to true

## why

this is to make sure the proxy orevents the browser from giving the CORS errors and allow to make the connection between the frontend and backend

after all of this you should have succesfully connected the backend to the frontend

## running both servers

npm run dev (react)
python manage.py runserver( python )
