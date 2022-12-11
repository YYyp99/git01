package com.yjx.node.dao;

import com.yjx.node.po.User;
import com.yjx.node.util.DBUtil;

import javax.xml.transform.Result;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;


public class UserDao {
    /**
     * 通过用户名查询用户对象
     *  1. 定义sql语句
     *  2. 设置参数集合
     *  3. 调用BaseDao的查询方法
     */
    public User queryUserByName(String username){
        //1. 定义sql语句
        String sql = "select * from tb_user where uname = ?";
        //2.设置参数集合
        List<Object> params = new ArrayList<>();
        params.add(username);

        //3.调用BaseDao的查询方法
        User user = (User)BaseDao.quertRow(sql,params,User.class);
         return user;

    }
    public User queryUserByName02(String username){
        /**
         * 通过用户名查询用户对象， 返回用户对象
         *             1. 获取数据库连接
         *             2. 定义sql语句
         *             3. 预编译
         *             4. 设置参数
         *             5. 执行查询，返回结果集
         *             6. 判断并分析结果集
         *             7. 关闭资源
         */
        User user = null;
        Connection connection =null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;

        try {
            //获取数据库连接
            connection = DBUtil.getConnection();
            //定义sql语句
            String sql =  "select * from tb_user where uname = ?";
            //预编译
            preparedStatement = connection.prepareStatement(sql);
            //设置参数
            preparedStatement.setString(1,username);
            //执行查询，返回结果集
            resultSet = preparedStatement.executeQuery();
            //判断并分析结果集
            if (resultSet.next()){
                user =new User();
                user.setUserId(resultSet.getInt("userId"));
                user.setUname(username);
                user.setHead(resultSet.getString("head"));
                user.setNick(resultSet.getString("nick"));
                user.setMood(resultSet.getString("mood"));
                user.setUpwd(resultSet.getString("upwd"));
            }


        }catch (Exception e){
            e.printStackTrace();
        }finally {
            DBUtil.close(resultSet,preparedStatement,connection); //关闭资源
        }

        return user;
    }

    /**
     *  通过昵称与用户ID查询用户对象
     *   1. 定义SQL语句
     *      通过用户ID查询除了当前登录用户之外是否有其他用户使用了该昵称
     *           指定昵称  nick （前台传递的参数）
     *           当前用户  userId （session作用域中的user对象）
     *           String sql = "select * from tb_user where nick = ? and userId != ?";
     *   2. 设置参数集合
     *   3. 调用BaseDao的查询方法
     * @param nick
     * @param userId
     * @return
     */
    public User queryUserByNickAndUserId(String nick, Integer userId) {
        // 1. 定义SQL语句
        String sql = "select * from tb_user where nick = ? and userId != ?";
        // 2. 设置参数集合
        List<Object> params = new ArrayList<>();
        params.add(nick);
        params.add(userId);
        // 3. 调用BaseDao的查询方法
        User user = (User) BaseDao.quertRow(sql, params, User.class);
        return user;
    }

    /**
     * 通过用户ID修改用户信息
     1. 定义SQL语句
     String sql = "update tb_user set nick = ?, mood = ?, head = ? where userId = ? ";
     2. 设置参数集合
     3. 调用BaseDao的更新方法，返回受影响的行数
     4. 返回受影响的行数
     * @param user
     * @return
     */
    public int updateUser(User user) {
        //1. 定义SQL语句
        String sql = "update tb_user set nick = ?, mood = ?,head = ? where userId = ?";
        //2. 设置参数集合
        List<Object> params = new ArrayList<>();
        params.add(user.getNick());
        params.add(user.getMood());
        params.add(user.getHead());
        params.add(user.getUserId());
        //3. 调用BaseDao的更新方法，返回受影响的行数
        int row = BaseDao.executeUpdate(sql,params);
        return row;
    }
}
