# Valhalla
Valheim (and other games) hosting in AWS, with features.

### Deployment and Usage
This application uses AWS Server Application Model (SAM) for local running and deployment.   
Run locally: `sam build && sam local start-api`
Deploy: `sam build && sam deploy --guided`

The web app is an angular app that can be served locally using `npm build && ng serve`.   
The webpage is deployed by uploaded the files located in ./dist/valhalla/ to the S3 bucket kestrel-valhalla