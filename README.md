# NShift Integration with Centra

This repository provides a demonstration of how to integrate NShift with Centra. Developers are encouraged to clone this repository to experiment with and test the integration locally.

## Installation
Clone the repository and navigate to cloned directory

## Install dependencies:
```bash
npm install
```
## Setting Up Environment Variables:
Set up the following environment variables in a `.env` file. This file should be placed in the root directory. If the file does not exist, you can create one.

```env
#nshift env variables
deliveryCheckoutId=
publicKey=
privateKey=
#centra env variables
centraUrl=
centraBearerToken=
```
## Start the development server:
```bash
npm run devStart
```
## Open your web browser and navigate to http://localhost:3001 to see the integration in action.