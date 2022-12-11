package com.yjx.node;

import com.yjx.node.util.DBUtil;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TestDB {
    // 使用日志工厂类，记录日志
    private Logger logger = LoggerFactory.getLogger(TestDB.class);

    //单元测试
    @Test
    public void testDB(){
        System.out.println(DBUtil.getConnection());

        // 使用日志
        logger.info("获取数据库链接："+DBUtil.getConnection());
        logger.info("获取数据库链接：{}",DBUtil.getConnection());
    }
}
