package com.jinax.adweb_backend.Config;

import com.jinax.adweb_backend.Component.JwtAuthenticationTokenFilter;
import com.jinax.adweb_backend.Component.MyUserDetails;
import com.jinax.adweb_backend.Component.RestfulAccessDeniedHandler;
import com.jinax.adweb_backend.Entity.User;
import com.jinax.adweb_backend.Service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * @author : chara
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled=true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserService userService;
    private final PasswordEncoder encoder;
    private final RestfulAccessDeniedHandler restfulAccessDeniedHandler;

    public SecurityConfig(UserService userService, PasswordEncoder encoder, RestfulAccessDeniedHandler restfulAccessDeniedHandler) {
        this.userService = userService;
        this.encoder = encoder;
        this.restfulAccessDeniedHandler = restfulAccessDeniedHandler;
    }

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf()// ??????????????????JWT????????????????????????csrf
                .disable()
                .sessionManagement()// ??????token??????????????????session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .antMatchers(HttpMethod.GET, // ????????????????????????????????????????????????
                        "/",
                        "/*.html",
                        "/favicon.ico",
                        "/**/*.html",
                        "/**/*.css",
                        "/**/*.js",
                        "/swagger-resources/**",
                        "/v2/api-docs/**"
                )
                .permitAll()
                .antMatchers(HttpMethod.OPTIONS)//??????????????????????????????options??????
                .permitAll()
                .antMatchers("/user/login")// ????????????????????????????????????
                .permitAll()
                .antMatchers("/user/register")// ????????????????????????????????????
                .permitAll()
//                .antMatchers("/webSocketServer")// 
//                .permitAll()
                .antMatchers("/**")//???????????????????????????
                .permitAll()
                .anyRequest()// ???????????????????????????????????????????????????
                .authenticated();
        // ????????????
        httpSecurity.headers().cacheControl();
        // ??????JWT filter
        httpSecurity.addFilterBefore(jwtAuthenticationTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        //????????????????????????????????????????????????
        httpSecurity.exceptionHandling()
                .accessDeniedHandler(restfulAccessDeniedHandler);
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService())
                .passwordEncoder(encoder);
    }

    @Bean
    public UserDetailsService userDetailsService() {
        //????????????????????????
        return new UserDetailsService() {
            // the name here is indeed identification
            @Override
            public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
                User user = userService.findByUserName(s);
                return new MyUserDetails(user);
            }
        };
    }
    @Bean
    public JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter(){
        return new JwtAuthenticationTokenFilter();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

}
