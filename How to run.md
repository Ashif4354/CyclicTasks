# How to run this project

## Clone the repository
```bash
git clone https://github.com/Ashif4354/CyclicTasks.git
```

## Configurations
- Create a Google cloud project 
- Get a firebase service account credentials
- Enable Cloud Logging API 
- Get a google cloud service account key with google cloud logging (you should have 'logging.logEntries.create' permission for this service account)
- Get recaptcha site key and secret key from google recaptcha (v2 invisible)
- If you are using discord webhook for logging/notifications, get the webhook url(s)

Now you have to add the acquired credentials to .env file of respective Frontend and Backend directories as mentioned.  
Instructions are in the .env.txt file of respective directories.


## For running in developer mode
- ### Frontend
    - Preqeuisites
        - Node.js 20.17.0 or higher
    - Steps
        ```bash
        cd CyclicTasks/Frontend
        npm install
        npm install -g vite@latest
        npm run dev
        ```

- ### Backend
    - Preqeuisites
        - Python 3.12.0 or higher
    - Configure the environment variables
        - Follow the steps in '.env.txt' file<br>
    - Steps
        ```bash
        cd CyclicTasks/Backend
        pip install poetry
        poetry config virtualenvs.in-project true
        poetry install
        python main.py
        ```
        - No need to create a virtual environment, poetry will take care of it

## For running in production mode
First build the Frontend to get static files
```bash
cd CyclicTasks/Frontend
npm run build
```

- ### Using Docker
    - Preqeuisites
        - Docker desktop installed
    - Steps
        ```bash
        cd CyclicTasks
        docker-compose build
        docker-compose up
        ```
        - This will start both FRONTEND and BACKEND in production mode

