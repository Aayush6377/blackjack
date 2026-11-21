package com.aayush.blackjack.security;

import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getPasswordHash() == null){
            throw new UsernameNotFoundException("This account uses Google/GitHub login. Please sign in with OAuth.");
        }

        return new UserPrincipal(user);
    }
}
