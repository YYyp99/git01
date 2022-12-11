package com.yjx.node.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.*;
import java.util.Properties;

public class DBUtil {
    //得到配置文件
    private static Properties properties = new Properties();

    static {
        try {
            //加载配置文件
            InputStream in = DBUtil.class.getClassLoader().getResourceAsStream("db.properties");
            //通过load方法将输入流的内容加载到配置文件中
            properties.load(in);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    //获取数据库的链接
    public static Connection getConnection(){
        Connection connection = null;

        try {
            //得到数据库链接的相关信息
            String dbUrl = properties.getProperty("dbUrl");
            String dbName = properties.getProperty("dbName");
            String dbPwd = properties.getProperty("dbPwd");
            //得到数据库的链接
            connection = DriverManager.getConnection(dbUrl,dbName,dbPwd);
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }

        return connection;
    }

    //关闭资源
    public static void close(ResultSet resultSet, PreparedStatement preparedStatement,Connection connection){


            try {
                //判断资源对象如果不为空，则关闭
                if (resultSet != null) {
                    resultSet.close();
                }
                if (preparedStatement != null){
                    preparedStatement.close();
                }
                if (connection != null){
                    connection.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
    }








}
