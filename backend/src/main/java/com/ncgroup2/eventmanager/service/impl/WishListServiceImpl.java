package com.ncgroup2.eventmanager.service.impl;

import com.ncgroup2.eventmanager.dao.WishListDao;
import com.ncgroup2.eventmanager.objects.WishListItem;
import com.ncgroup2.eventmanager.entity.WishList;
import com.ncgroup2.eventmanager.service.WishListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishListServiceImpl implements WishListService{

    @Autowired
    private WishListDao wishListDao;

    public WishList getById(String wishlist_id){

        return wishListDao.getById(wishlist_id);
    }

    public WishList getByEventId(String event_id){

        return wishListDao.getEntityByField("event_id", event_id);
    }

    public WishList getBookedItems(String booker_customer_login){

        return wishListDao.getEntityByField("booker_customer_login", booker_customer_login);
    }

    public void create(WishList wishList){

        wishListDao.create(wishList);
    }

    public void updateByField(Object item_wishlist_id, String fieldName, Object fieldValue){

        wishListDao.updateField(item_wishlist_id, fieldName, fieldValue);
    }

    public void update(WishList wishList){

        wishListDao.update(wishList);
    }

    public void deleteItems(List<WishListItem> trash){

        wishListDao.deleteItems(trash);
    }
}
