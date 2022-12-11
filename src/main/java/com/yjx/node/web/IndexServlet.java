package com.yjx.node.web;

import com.yjx.node.po.Note;
import com.yjx.node.po.User;
import com.yjx.node.service.NoteService;
import com.yjx.node.util.Page;
import com.yjx.node.vo.NoteVo;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/index")
public class IndexServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 设置首页导航高亮
        request.setAttribute("menu_page", "index");

        //得到用户行为（标题查询，日期查询，类型查询）
        String actionName = request.getParameter("actionName");

        //将用户行为设置到requset作用域中
        request.setAttribute("action",actionName);
        //判断用户行为
        if ("searchTitle".equals(actionName)){
            //通过标题查询
            //得到查询条件 标题
            String title = request.getParameter("title");

            //将查询条件设置到request作用域中，回显查询条件
            request.setAttribute("title",title);
            //标题搜索
            noteList(request,response,title,null,null);

        }else if ("searchDate".equals(actionName)){
            //通过日期查询
            //得到查询条件 日期
            String date = request.getParameter("date");
            //将查询条件设置到request作用域中，回显查询条件
            request.setAttribute("date",date);

            //日期搜索
            noteList(request,response,null,date,null);

        }else if ("serchType".equals(actionName)){
            //通过类型查询
            //得到查询条件 日期
            String typeId = request.getParameter("typeId");
            //将查询条件设置到request作用域中，回显查询条件
            request.setAttribute("typeId",typeId);

            //日期搜索
            noteList(request,response,null,null,typeId);
        }
        else{
            //分页查询云记列表
            noteList(request,response,null,null,null);
        }



        //设置首页动态包含的页面
        request.setAttribute("changePage","node/list.jsp");
        //请求转发到index.jsp
        request.getRequestDispatcher("index.jsp").forward(request,response);
    }

    /**
     * 分页查询云记列表
     *   1. 接收参数 （当前页、每页显示的数量）
     *   2. 获取Session作用域中的user对象
     *   3. 调用Service层查询方法，返回Page对象
     *   4. 将page对象设置到request作用域中
     * @param request
     * @param response
     */
    private void noteList(HttpServletRequest request, HttpServletResponse response,String title,String date,String typeId) {
        //1. 接收参数 （当前页、每页显示的数量）
        String pageNum = request.getParameter("pageNum");
        String pageSize = request.getParameter("pageSize");

        //2. 获取Session作用域中的user对象
        User user = (User) request.getSession().getAttribute("user");

        //3. 调用Service层查询方法，返回Page对象
        Page<Note> page = new NoteService().findNoteListByPage(pageNum,pageSize,user.getUserId(),title,date,typeId);

        //4. 将page对象设置到request作用域中
        request.setAttribute("page",page);

        //通过日期分组查询当前登录用户下的云记数量
        List<NoteVo> dateInfo = new NoteService().findNoteCountByDate(user.getUserId());
        //设置集合存放在session作用域中
        request.getSession().setAttribute("dateInfo",dateInfo);

        //通过类型分组查询当前登录用户下的云记数量
        List<NoteVo> typeInfo = new NoteService().findNoteCountByType(user.getUserId());
        //设置集合存放在session作用域中
        request.getSession().setAttribute("typeInfo",typeInfo);
    }
}
