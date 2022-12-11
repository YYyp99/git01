package com.yjx.node.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * 封装返回结果的类
 *   状态码 1成功 0失败
 *   提示信息
 *   返回的对象（字符串，JavaBean，集合，map）
 */
@Setter
@Getter
public class ResultInfo<T> {
    private Integer code;//状态码 1成功 0失败
    private String msg;//提示信息
    private T result;//返回的对象
}
