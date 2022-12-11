package com.yjx.node.filter;

import cn.hutool.core.util.StrUtil;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;
@WebFilter("/*") //过滤所有资源
public class EncodingFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        //基于http的  强转
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        //处理POST请求 （只针对POST请求有效，GET请求不受影响）
        request.setCharacterEncoding("UTF-8");

        //得到请求类型 （GET|POST）
        String method = request.getMethod();
        // 如果是GET请求，则判断服务器版本
        if ("GET".equalsIgnoreCase(method)){//忽略大小写的比较
            //得到服务器的版本
            String serverInfo = request.getServletContext().getServerInfo(); //比如 Apache Tomcat/7.0.79

            //截取字符串 获得版本号
            String version = serverInfo.substring(serverInfo.lastIndexOf("/")+1,serverInfo.indexOf("."));

            //判断服务器版本是否是Toncat7级以下
            if (version != null && Integer.parseInt(version) < 8){
                // Tomcat7及以下版本的服务器的GET请求
                MyWapper myRequest = new MyWapper(request);
                // 放行资源
                filterChain.doFilter(request,response);
                return;
            }
        }
        filterChain.doFilter(request,response);
    }

    /**
     * 1. 定义内部类 （类的本质是request对象）
     * 2. 继承 HttpServletRequestWrapper包装类
     * 3. 重写getarameterP()方法
     */
    class MyWapper extends HttpServletRequestWrapper {
        // 定义成员变量 HttpServletRequest对象 （提升构造器中request对象的作用域）
        private HttpServletRequest request;
        public MyWapper(HttpServletRequest request) {
            super(request);
            this.request = request;
        }

        //重写getParameter方法，处理乱码问题
        @Override
        public String getParameter(String name){
          //获取参数 （乱码的参数值）
          String value = request.getParameter(name);
          //判断参数值是不是为空
            if (StrUtil.isBlank(value)){
                return value;
            }
            //通过 new String 处理乱码
            try {
                value = new String(value.getBytes("ISO-8859-1"),"UTF-8");
            }catch (Exception e){
                e.printStackTrace();
            }
            return value;
        }
    }

    @Override
    public void destroy() {

    }
}
