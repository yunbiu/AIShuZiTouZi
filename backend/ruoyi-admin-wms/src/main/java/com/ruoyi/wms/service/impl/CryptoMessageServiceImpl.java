package com.ruoyi.wms.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import com.ruoyi.wms.domain.entity.CryptoMessage;
import com.ruoyi.wms.mapper.CryptoMessageMapper;
import com.ruoyi.wms.service.CryptoMessageService;
import org.springframework.stereotype.Service;

@Service
public class CryptoMessageServiceImpl extends ServiceImpl<CryptoMessageMapper, CryptoMessage> implements CryptoMessageService {
}
