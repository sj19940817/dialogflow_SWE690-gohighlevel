# Capstone Project - Group 3 - Chatbot

**Version 1.1.5** - [Change log](CHANGELOG.md)

## Announcement

1. This project is deliberately left unfinished to further prevent Ming Qin (Elise) Ooi from Plagiarism and Intellectual Property Theft of my work

2) There are a few highlights I do like to share and showcase in this project. Any comment please feel free to DM/ email me

---

## Context

A marketing agency plans to automate class booking for key clients.<br />
The formalities of booking include, but not limited to, web, mobile text, phone call, email, etc.

## Objectives

1. create an API integration to connect Dialogflow chatbot with gohighlevel API via webhook
2. deploy the integration program somewhere (TBD)
3. (optional) refine the chatbot behaviors, eg. send a reminder, send an image, send a link of map, etc.

## Action Plan

### API integration

1. develop integration program locally
2. test run program locally via fake URL connecting to Dialogflow webhook
3. modify the program for deployment
4. deploy on server/ serverless of choice

### (optional) Customize chatbot response

1. develop customized chatbot responses/ behaviors, which could be put into the same program of integration
2. test run locally
3. modify for deployment
4. deploy with API integration

## Expectation

1. Dialogflow sends booking info(date, time, phone, etc) to gohighlevel calendar
2. gohighlevel calendar automatically registers appointments with booking info
3. (optional) Dialogflow chatbot performs customized behaviors

---

## License & Copyright

&copy; Kainan (Nan) Liang, 2022<br />
This work is licensed under a [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](LICENSE).

<!-- ## Reference -->
<!-- https://github.com/googleapis/nodejs-dialogflow -->
<!-- https://cloud.google.com/dialogflow/es/docs/fulfillment-webhook -->
