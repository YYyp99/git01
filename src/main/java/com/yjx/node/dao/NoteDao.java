package com.yjx.node.dao;

import cn.hutool.core.util.StrUtil;
import com.yjx.node.po.Note;
import com.yjx.node.vo.NoteVo;

import java.util.ArrayList;
import java.util.List;

public class NoteDao {
    /**
     * 添加或修改云记，返回受影响的行数
     * @param note
     * @return
     */
    public int addOrUpdate(Note note) {
        //定义sql语句
        String sql = "";
        //添加参数
        List<Object> params = new ArrayList<>();
        params.add(note.getTypeId());
        params.add(note.getTitle());
        params.add(note.getContent());

        //判断noteId是否为空，如果为空，则为添加操作，如果不为空，则为修改操作
        if (note.getNoteId() == null){
            //添加操作
            sql = "insert into tb_note (typeId,title,content,pubTime,lon,lat) values (?,?,?,now(),?,?) ";
            params.add(note.getLon());
            params.add(note.getLat());
        }else {
            //修改操作
            sql = " update tb_note set typeId = ?, title = ? , content = ? where noteId = ? ";
            params.add(note.getNoteId());
        }


        //调用basedao的方法添加数据
        int row = BaseDao.executeUpdate(sql,params);
        return row;
    }

    /**
     * 查询当前登录用户的云记数量，返回总记录数
     * @param userId
     * @return
     */
    public long findNoteCount(Integer userId,String title,String date,String typeId) {
        //定义sql语句
        String sql = "select count(1) from tb_note n inner join tb_note_type t on n.typeId = t.typeId where userId = ? ";

        //设置参数
        List<Object> params = new ArrayList<>();
        params.add(userId);

        //判断条件查询的参数是否为空（如果不为空，则拼接sql语句，并设置所需要的参数）
        if (!StrUtil.isBlank(title)){
            //标题查询
            //拼接sql语句
            sql += " and title like concat('%',?,'%') ";
            params.add(title);
        }else if (!StrUtil.isBlank(date)){
            //日期查询
            //拼接sql语句
            sql += " and date_format(pubTime,'%Y年%m月') = ? ";
            params.add(date);
        }else if (!StrUtil.isBlank(typeId)){
            //类型查询
            //拼接sql语句
            sql += " and n.typeId = ? ";
            params.add(typeId);
        }

        //调用basedao的查询方法
        long count = (long) BaseDao.findSingleValue(sql,params);

        return count;

    }

    /**
     * 分页查询当前登录用户下当前页的数据列表，返回note集合
     * @param userId
     * @param index
     * @param pageSize
     * @return
     */
    public List<Note> findNoteListByPage(Integer userId, Integer index, Integer pageSize,String title,
                                         String date,String typeId) {
        //定义sql语句
        String sql = "select noteId,title,pubTime from tb_note n " +
                "inner join tb_note_type t on n.typeId = t.typeId where userId = ? " ;


        //设置参数
        List<Object> params = new ArrayList<>();
        params.add(userId);

        //判断条件查询的参数是否为空（如果不为空，则拼接sql语句，并设置所需要的参数）
        if (!StrUtil.isBlank(title)){
            //拼接sql语句
            sql += "and title like concat('%',?,'%')";
            params.add(title);
        }else if (!StrUtil.isBlank(date)){
            //日期查询
            //拼接sql语句
            sql += " and date_format(pubTime,'%Y年%m月') = ? ";
            params.add(date);
        }else if (!StrUtil.isBlank(typeId)){
            //类型查询
            //拼接sql语句
            sql += " and n.typeId = ? ";
            params.add(typeId);
        }

        //拼接分页的sql语句  limit需要写在最后面
        sql += " order by pubTime desc limit ?,?";

        params.add(index);
        params.add(pageSize);

        //调用basedao的查询方法
        List<Note> noteList = BaseDao.queryRows(sql,params,Note.class);

        return noteList;
    }

    /**
     * 通过日期分组查询当前登录用户下的云记数量
     * @param userId
     * @return
     */
    public List<NoteVo> findNoteCountByDate(Integer userId) {
        //准备sql
        String sql = "select count(1) noteCount,DATE_FORMAT(pubTime,'%Y年%m月') groupName " +
                " from tb_note n " +
                " inner join tb_note_type t " +
                " on n.typeId = t.typeId " +
                " where userId = ? " +
                " GROUP BY DATE_FORMAT(pubTime,'%Y年%m月') " +
                " ORDER BY DATE_FORMAT(pubTime,'%Y年%m月') desc ";

        //设置参数
        List<Object> params = new ArrayList<>();
        params.add(userId);

        //调用basedao的查询方式
        List<NoteVo> list = BaseDao.queryRows(sql,params,NoteVo.class);
        return list;
    }

    /**
     * 通过类型分组查询当前登录用户下的云记数量
     * @param userId
     * @return
     */
    public List<NoteVo> findNoteCountByType(Integer userId) {
        //定义sql语句
        String sql = " SELECT count(noteId) noteCount, t.typeId, typeName groupName FROM tb_note n " +
                " RIGHT JOIN tb_note_type t ON n.typeId = t.typeId WHERE userId = ? " +
                " GROUP BY t.typeId ORDER BY COUNT(noteId) DESC ";

        //设置参数
        List<Object> params = new ArrayList<>();
        params.add(userId);
        //调用basedao的查询方式
        List<NoteVo> list = BaseDao.queryRows(sql,params,NoteVo.class);
        return list;

    }

    /**
     * 通过id查询云记内容
     * @param noteId
     * @return
     */
    public Note findNoteById(String noteId) {
        //定义sql
        String sql = "select noteId,title,content,pubTime,typeName,n.typeId from tb_note n" +
                " inner join tb_note_type t on n.typeId = t.typeId where noteId = ?";
        //设置参数
        List<Object> params = new ArrayList<>();
        params.add(noteId);
        //调用basedao的查询方式
        Note note = (Note) BaseDao.quertRow(sql,params,Note.class);
        return note;
    }

    /**
     * 通过noteId 删除 云记记录 返回受影响的行数
     * @param noteId
     * @return
     */
    public int deleteNoteById(String noteId) {
        //准备sql语句
        String sql = "delete from tb_note where noteId = ? ";
        //准备参数
        List<Object> params = new ArrayList<>();
        params.add(noteId);
        //调用basedao的查询方式
        int row = BaseDao.executeUpdate(sql,params);
        return row;
    }

    /**
     * 通过用户id查询云记列表
     * @param userId
     * @return
     */
    public List<Note> queryNoteList(Integer userId) {
        //定义sql语句
        String sql = "select lon,lat from tb_note n inner join tb_note_type t on n.typeId = t.typeId where userId = ?";
        //设置参数
        List<Object> params = new ArrayList<>();
        params.add(userId);

        //调用basedao的查询方法
        List<Note> list = BaseDao.queryRows(sql,params,Note.class);

        return list;

    }
}
