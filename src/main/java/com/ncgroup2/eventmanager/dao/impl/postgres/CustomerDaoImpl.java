package com.ncgroup2.eventmanager.dao.impl.postgres;

import com.ncgroup2.eventmanager.dao.CustomerDao;
import com.ncgroup2.eventmanager.entity.Customer;
import com.ncgroup2.eventmanager.mapper.CustomerMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.support.JdbcDaoSupport;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collection;

@Repository
@Transactional
public class CustomerDaoImpl extends JdbcDaoSupport implements CustomerDao {

    public static final String BASE_SQL = "SELECT * FROM \"Customer\" ";

    @Autowired
    DataSource dataSource;

    @PostConstruct
    private void initialize() {
        setDataSource(dataSource);
    }

    @Override
    public void updateField(Customer customer, String fieldName, Object fieldValue) {

        String sql = "UPDATE \"Customer\" SET " + fieldName + " = ? WHERE id = CAST (? AS uuid)";

        Object[] params = new Object[]{
                fieldValue,
                customer.getId()
        };

        this.getJdbcTemplate().update(sql, params);

    }

    @Override
    public Customer getByField(String fieldName, String fieldValue) {
        Collection<Customer> customers = getCustomers(fieldName, fieldValue);
        if (!customers.isEmpty()) {
            return getCustomers(fieldName, fieldValue).iterator().next();
        } else {
            return null;
        }
    }

    @Override
    public void addCustomer(Customer customer) {

        String sql = "INSERT INTO \"Customer\" " +
                "(id,name,second_name,phone,login,email,password,isverified,token,avatar,registration_date)" +
                " values(uuid_generate_v1(),?,?,?,?,?,?,?,?,?,?)";

        Object[] params = customer.getParams();

        params[params.length-1] = new Timestamp(Instant.now().toEpochMilli());

//                new Object[]{
//                customer.getName(),
//                customer.getSecondName(),
//                customer.getPhone(),
//                customer.getLogin(),
//                customer.getEmail(),
//                customer.getPassword(),
//                customer.isVerified(),
//                new Timestamp(Instant.now().toEpochMilli())};

        this.getJdbcTemplate().update(sql, params);

        String sqlRole = "INSERT INTO \"Customer_Role\" VALUES (" +
                "uuid_generate_v1()," +
                "(SELECT id FROM \"Customer\" WHERE login = ?)," +
                "(SELECT id FROM \"Role\" WHERE name = 'USER')" +
                ")";

        Object[] roleParams = new Object[]{customer.getLogin()};
        this.getJdbcTemplate().update(sqlRole, roleParams);

    }

    @Transactional
    @Override
    public void deleteCustomer(Customer customer) {

        String sqlCustomer = "DELETE FROM \"Customer\" WHERE id = CAST (? AS uuid)";

        Object[] params = new Object[]{customer.getId()};

        this.getJdbcTemplate().update(sqlCustomer, params);

    }

    @Override
    public Collection<Customer> getCustomers(String fieldName, String fieldValue) {

        String sql = BASE_SQL + "WHERE " + fieldName + " = ?";

        Object[] params = new Object[]{fieldValue};
        CustomerMapper mapper = new CustomerMapper();

        try {
            return this.getJdbcTemplate().query(sql, params, mapper);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    @Override
    public Collection<Customer> getCustomers() {

        CustomerMapper mapper = new CustomerMapper();

        try {
            return this.getJdbcTemplate().query(BASE_SQL, mapper);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }


    @Override
    public void updateCustomer(Customer customer) {

        String sql = "UPDATE \"Customer\" SET " +
                "name = ?, " +
                "second_name = ?, " +
                "phone = ?, " +
                "login = ?, " +
                "email = ?, " +
                "password = ?, " +
                "isverified = ?, " +
                "token = ?, " +
                "avatar = ? " +
                " WHERE id = CAST (? AS uuid)";

        Object[] params = customer.getParams();

        this.getJdbcTemplate().update(sql, params);
    }

    @Override
    public void deleteUnverifiedCustomers() {

        String sqlUnverified = "DELETE FROM \"Customer\"" +
                "WHERE isVerified = \'false\'" +
                "AND (LOCALTIMESTAMP - registration_date) >= \'24 hour\';";

        this.getJdbcTemplate().update(sqlUnverified);
    }
}
