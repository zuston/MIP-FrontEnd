# -*- coding:utf-8 -*-
import pymysql.cursors
import logging

con = None

class Db(object):
    def __init__(self,**config):
        self.config = config
        self.__checkParams()
        self.dbname = self.config['dbname']
        self.__con = self.__getConn()

    def __checkParams(self):
        if not self.config.has_key('host') or not self.config.has_key("user") or not self.config.has_key("password") or not self.config.has_key("dbname"):
            raise Exception("please enter the param")
        if not self.config.has_key('charset'):
            self.config['charset'] = 'utf8mb4'


    def __getConn(self):
        global con
        if not con:
            print 'new connection'
            logging.info('new connection')
            connection = pymysql.connect(host=self.config['host'],
                                         user=self.config['user'],
                                         password=self.config['password'],
                                         db=self.dbname,
                                         charset=self.config['charset'],
                                         cursorclass=pymysql.cursors.DictCursor)
            con = connection
            return connection
        else:
            print 'reuse the connection'
            return con


    def getOne(self,tableName,whereCondition=None):
        if whereCondition is None:
            whereCondition = ''
        result = None
        try:
            with self.__con.cursor() as cursor:
                sql = 'select * from '+tableName+' '+whereCondition
                # sql = tableName
                cursor.execute(sql)
                result = cursor.fetchone()
        finally:
            # self.__con.close()
            return result

    def insert(self,sql):
        result = 0
        try:
            with self.__con.cursor() as cursor:
                result = cursor.execute(sql)
        finally:
            # self.__con.close()
            return result

    def execute(self,sql):
        result = None
        try:
            with self.__con.cursor() as cursor:
                cursor.execute(sql)
                result = cursor.fetchall()
        finally:
            # self.__con.close()
            return result



if __name__ == '__main__':
    a = Db(host='localhost',user='root',password='shacha',dbname='material')
    result = a.execute("select z,symbol,mass,electronegativity,name from elements")
    import json
    print json.dumps(result)
