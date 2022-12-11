package com.yjx.node.po;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
@Setter
@Getter
public class Note {
    private Integer noteId;//云记Id
    private String title; // 云记标题
    private String content; //云记内容
    private Integer typeId; //云记类型
    private Date pubTime; //发布时间
    private String typeName;

    private Float lon; //经度
    private Float lat; //纬度
}
