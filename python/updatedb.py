#!/usr/bin/python
from mechanize import Browser
import sys
from bs4 import BeautifulSoup as bs
import mysql.connector
import datetime
import os
import json

reload(sys)  
sys.setdefaultencoding('utf8')

def print_info(message):
    print("[INF] " + message)

def print_error(message):
    print("[ERR] " + message)
    sys.exit()

print("[INF] Script started.")

try: 
    creds_file = open(os.path.join(os.path.dirname(__file__),'../.credentials'))
    creds = json.load(creds_file)
except IOError:
    print_error("Could not read credentials file.")
except json.JSONDecodeError:
    print_error("Could not parse credentials file.")

print_info("Credentials were successfully accessed.")

now = datetime.datetime.now()

br = Browser()
br.set_handle_robots(False)
try: 
    response = br.open(creds["scrape"]["url"])
except:
    print_error("Could not load login page.")

print_info("Loaded login page.")

br.select_form(nr=0)
br.form['username'] = creds["scrape"]["personal"]["username"]
br.form['password'] = creds["scrape"]["personal"]["password"]

try: 
    br.submit()
except:
    print_error("Could not log in.")

print_info("Logged in.")

soup = bs(br.response().read(), "html5lib")

try:
    data = soup.select_one(creds["scrape"]["data-selector"]).text
    days = soup.select_one(creds["scrape"]["days-selector"]).text
except:
    print_error("Could not get information from parsed HTML.")

print_info("Retrieved information from parsed HTML.")

try:
    cnx = mysql.connector.MySQLConnection(user=creds["sql"]["username"], 
                                    password=creds["sql"]["password"],
                                    host='127.0.0.1',
                                    database=creds["sql"]["database"])
except:
    print_error("Could not access database.")

print_info("Opened database.")

cursor = cnx.cursor()
query = (
    '''
    INSERT INTO data
    (date, data, days_left)
    VALUES
    (%s, %s, %s)
    '''
)
query_inserts = (
    now.strftime('%Y-%m-%d'),
    data,
    days
)

try:
    cursor.execute(query,query_inserts)
except mysql.connector.errors.IntegrityError:
    print_error("An entry with today's timestamp already exists.")

cnx.commit()
cursor.close()
cnx.close()

print("Committed changes.")