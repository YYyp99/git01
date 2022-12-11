package com.yjx.node.util;

import com.alibaba.fastjson.JSON;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
 *将对象转换成json格式的字符串，响应给ajax的回调函数
 */
public class JsonUtil {
    public static void toJson(HttpServletResponse response, Object result){
        try {
            //设置响应类型及编码格式（json格式）
            response.setContentType("application/json;charset=UTF-8");
            //得到字符输出流
            PrintWriter out = response.getWriter();
            //通过fastjson的方法，将resultInfo对象转换成json格式的字符串
            String json = JSON.toJSONString(result);
            //通过输出流输出json格式的字符串
            out.write(json);
            //关闭资源
            out.close();
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
