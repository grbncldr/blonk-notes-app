## Let's build an app with Kiro


Build me an application, which manages notes. It's a webapplication build with vue and having python as an api backend. The application needs to show a list of notes, add a note, edit a note and delete a note.

make a run-backend.sh
make a run-frontend.sh


Cannot read properties of undefined (reading 'localeCompare')

Found it. The backend serializes timestamps as created_at / updated_at (snake_case), but the frontend Note interface expects createdAt / updatedAt (camelCase). When the API response arrives, note.updatedAt is undefined, causing the localeCompare crash.

The fix: update the backend's to_dict() to emit camelCase keys, matching the frontend interface.






add a steering file about the pep8 styling guide for python

add a steering file about the best practise for vue applications


## Let's introduce a bug

In service.py -> Line 18, get-all , make it get-all-notes

restart the app

trigger the bug

See what Kiro can do to fix this -> Bug fix mode. 

## Quick spec mode


for testing, enable local storage of the notes on the backend side. 


## Repository 

https://bit.ly/blonk-notes-app





